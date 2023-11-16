from fileinput import filename
import docker
import os

from flask import url_for

def create_site(urls = []):
    #0) create a custom name for the container based on the user's id, and the number of containers they have running
    #TODO: QUERY TO GET UID AND FNAME AND LNAME, and SITECOUNT
    uid = 3
    fname = "jacob"
    lname = "graham"
    site_count = 3

    container_name = f"user_{uid}{fname[0]}{lname[0]}_site_{site_count + 1}"

    #TODO: UPDATE USER SITE_COUNT AT THE END

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
            ports={'80/tcp': '80'})  #remove ports later

        #save vars needed later
        id = image = container.attrs['Id']
        image = container.attrs['Config']['Image']

    except docker.errors.APIError as e:
        print(f"Error with compose.create: {e}")
        raise   #raise most recently caught exception
    finally:
        client.close()
        
    

	#3) add traefik tags to handle url routing

	

	#4) create a db model for the container, saving all data that would be necessary to rebuild it from scratch if necessary


    return True

def delete_site():
    pass