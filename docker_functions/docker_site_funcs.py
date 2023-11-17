from fileinput import filename
import docker
import os
from database_manager import Website

from app import db

def create_site(user, hostname):
    '''takes a user, and creates a website for them'''
    #0) create a custom name for the container based on the user's id, and the number of containers they have running
    container_name = f"user_{user.id}{user.fname[0]}{user.lname[0]}_site_{len(user.websites)}"


    #1) create a volume for the container using its id.  For now, copy the custom index.html into it.
    host_path = f"{os.path.dirname(os.path.abspath(__file__))}/../volumes/{container_name}"
    print("host path: " + host_path)

    #make directories for path
    if not os.path.exists(host_path):
        os.makedirs(host_path)

    #create index file
    with open(f"{host_path}/index.html", 'w') as file:
        file.write(f'Index file for {container_name}')

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
        container_id = image = container.attrs['Id']
        container_image = container.attrs['Config']['Image']

    except docker.errors.APIError as e:
        print(f"Error with compose.create: {e}")
        raise   #raise most recently caught exception
    finally:
        client.close()

	#4) create a db model for the container, saving all data that would be necessary to rebuild it from scratch if necessary
    site = Website(
        name=container_name,
        docker_id=container_id,
        volume_path=f"/{container_name}",
        image=container_image,
        hostname = hostname,
        user=user
    )
    db.session.add(site)
    db.session.commit()
    print("Site saved!")
    return True

def delete_site():
    pass