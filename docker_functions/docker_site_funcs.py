from fileinput import filename
import docker
import os
import shutil
import string
import random
import io
from database_manager import Website, PermissionLink

from app import db

def create_site(user, form_data, model=None):
    '''takes a user and a hostname, and creates a website for them with that hostname pointing to it.  "model" is the model to use if a db model for this site already exists'''
    #0) insert blank record, and create a custom name for the container based on the user's id and container's id
    site = Website(
        name="",
        docker_id="",
        volume_path="",
        image="",
        hostname = form_data.host_name.data,
        name_lbl = form_data.name_lbl.data,
        desc_lbl = form_data.desc_lbl.data,
        user=user,
        plan=1,
        ssh_key = ''.join(random.choice(string.ascii_lowercase) for i in range(30))
    )

    #check if model was passed in
    if model != None:
        site = model

    #do this here because I need to get the id of the site
    db.session.add(site)
    db.session.commit()
    container_name = f"user_{user.id}{user.fname[0]}{user.lname[0]}_site_{site.id}"



    #1) create a volume for the container using its id.  For now, copy the custom index.html into it.
    host_path = f"{os.path.dirname(os.path.abspath(__file__))}/../volumes/{container_name}"
    print("host path: " + host_path)

    #make directories for path
    if not os.path.exists(host_path):
        os.makedirs(host_path)

    #create index file
    with open(f"{host_path}/index.html", 'w') as file:
        file.write(f'<h3>Index file for {site.name_lbl}</h3>')

    volume_config = {
        host_path: {'bind': f'/var/www/html/', 'mode': 'rw'}
    }


    #2) create docker container.  Save details about its name, id, image, version, etc.
    client = docker.from_env()

    try:
        #build the image
        dockerfile = f'''
FROM debian:bullseye

RUN apt-get update && \
    apt-get install -y apache2

CMD ["apache2ctl", "-D", "FOREGROUND"]
'''
        # TURNS OUT, TRAEFIK CANT ROUTE SSH TRAFFIC BASED ON DOMAIN NAME (https://community.traefik.io/t/ssh-proxy-from-traefik-to-lxc/608)
        image = client.images.build(
            fileobj=io.BytesIO(dockerfile.encode('utf-8')),
            rm=True,
            tag='web_hosting_debian'
        )[0]

        #run container
        container = client.containers.run(
            "web_hosting_debian",
            name=container_name,
            detach=True,
            volumes=volume_config,
            # ports={'22/tcp': '2022'},   #internal : external
            labels={
                'traefik.enable': 'true',

                # HTTP labels
                f'traefik.http.routers.{container_name}.rule': f'Host(`{form_data.host_name.data}`)',
                f'traefik.http.routers.{container_name}.entrypoints': 'web',
                f'traefik.http.services.{container_name}.loadbalancer.server.port': '80',

                # TCP labels
                # TURNS OUT, TRAEFIK CANT ROUTE SSH TRAFFIC BASED ON DOMAIN (https://community.traefik.io/t/ssh-proxy-from-traefik-to-lxc/608)
                # f'traefik.tcp.routers.{container_name}.entrypoints': 'ssh',
                # f'traefik.tcp.routers.{container_name}.rule': f'HostSNI(`{form_data.host_name.data}`)',
                # f'traefic.tcp.routers.{container_name}.tls': 'false',
                # f'traefik.tcp.services.{container_name}.loadbalancer.server.port': '22',
                # f"traefik.tcp.routers.{container_name}.service": f"{container_name}@docker"

            },
        )  # remove ports later

        #save vars needed later
        container_id = container.attrs['Id']
        container_image = container.attrs['Config']['Image']

    except docker.errors.APIError as e:
        print(f"Error with compose.create: {e}")

        #delete the model stub instance, if the container was not created
        db.session.delete(site)
        db.session.commit()

        raise   #raise most recently caught exception
    finally:
        client.close()

	#4) update db model with container info, saving all data that would be necessary to rebuild it from scratch if necessary
    #site = session.query(YourModel).get(1)
    site.name = container_name
    site.docker_id = container_id
    site.image = container_image
    site.volume_path = f"/{container_name}"
    
    #use the preexisting model if it exists
    if model != None:
        site = model

    db.session.add(site)
    db.session.commit()
    print("Site saved!")

    update_site_plan(site, site.plan)

    return True

def delete_site(site):
    '''takes an instance of a site model, and deletes it, its container, and its volume'''

    #1) delete container associated with that model
    client = docker.from_env()
    try:
        #get the site's container
        container = client.containers.get(site.name)

        #stop and remove the container
        container.stop()
        container.remove()

    except docker.errors.APIError as e:
        print(f"Error with compose.delete: {e}")
        raise   #raise most recently caught exception
    finally:
        client.close()


    #2) delete volume associated with the model
    try:
        #path to the volume to delete
        directory_path = f"{os.path.dirname(os.path.abspath(__file__))}/../volumes/{site.name}"

        #use shutil.rmtree to remove the directory and its contents
        shutil.rmtree(directory_path)

        print('Container volume removed successfully')

    except Exception as e:
        print(f'Error removing volume: {str(e)}')
        raise

    #3) delete the model record from the db
    db.session.delete(site)
    db.session.commit()

def update_site_plan(site: Website, newPlan: int):
    planIndex = newPlan-1
    cores = ["0", "0-1", "0-3"]
    memory = ["128m", "512m", "1g"]

    # Edit the attributes of the container
    client = docker.from_env()
    try:
        #get the site's container
        container = client.containers.get(site.name)

        # print(" ~~ CONTAINER ATTRS ~~")
        # for attrKey in container.attrs["HostConfig"].items():
        #     if "cpu" in attrKey[0].lower():
        #         print(f" *********** {attrKey[0]}: {attrKey[1]}")
        #     else:
        #         print(f" {attrKey[0]}: {attrKey[1]}")
        # print(" ~~ END ~~")

        # container.attrs["HostConfig"]["CpusetCpus"] = cores[newPlan-1]

        container.update(cpuset_cpus = cores[planIndex], mem_limit = memory[planIndex], memswap_limit = memory[planIndex])

        container.reload()
        

    except docker.errors.APIError as e:
        print(f"Couldn't change container properties: {e}")
        raise   #raise most recently caught exception
    finally:
        client.close()

    # Update the model record in the db
    site.plan = newPlan
    db.session.commit()

def share_site(target_user, site):
    # Create an entry for sharing the given site with the given user
    link = PermissionLink(user_id = target_user.id, site_id = site.id)
    db.session.add(link)
    db.session.commit()

def unshare_site(permission_link):
    # Delete the link from the database
    db.session.delete(permission_link)
    db.session.commit()