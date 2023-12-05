from fileinput import filename
import docker
import os
import shutil
from database_manager import Website

from app import db

def create_site(user, hostname, model=None):
    '''takes a user and a hostname, and creates a website for them with that hostname pointing to it.  "model" is the model to use if a db model for this site already exists'''
    #0) insert blank record, and create a custom name for the container based on the user's id and container's id
    site = Website(
        name="",
        docker_id="",
        volume_path="",
        image="",
        hostname = hostname,
        user=user,
        plan=1
    )

    #check if model was passed in
    if model != None:
        site = model


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
        file.write(f'<h3>Index file for {container_name}</h3>')

    volume_config = {
        host_path: {'bind': f'/usr/local/apache2/htdocs/', 'mode': 'rw'}
    }


    #2) create docker container.  Save details about its name, id, image, version, etc.
    client = docker.from_env()

    try:
        #run container
        container = client.containers.run(
            "httpd:2.4",
            name = container_name,
            detach=True,
            volumes = volume_config,
            labels = {
                'traefik.enable': 'true',
                f'traefik.http.routers.{container_name}.rule': f'Host(`{hostname}`)',
                f'traefik.http.routers.{container_name}.entrypoints': 'web',
            },
        )  #remove ports later

        #save vars needed later
        container_id = container.attrs['Id']
        container_image = container.attrs['Config']['Image']

    except docker.errors.APIError as e:
        print(f"Error with compose.create: {e}")
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
