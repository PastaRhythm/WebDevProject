from fileinput import filename
import docker
import os

from flask import url_for

def create_site():
    #1) create docker container.  Save details about its name, id, image, version, etc.
    client = docker.from_env()

    try:
        #run container
        container = client.containers.run("httpd:2.4", detach=True, ports={'80/tcp': '80'})  #remove ports later

        print(f"Docker compose.create ran successfully")

    except docker.errors.APIError as e:
        print(f"Error with compose.create: {e}")
        raise   #raise most recently caught exception
    finally:
        client.close()
        
    

	#2) add traefik tags to handl url routing

	#3) create a volume for the container using its id.  For now, copy the custom index.html into it.

	#4) create a db model for the container, saving all data that would be necessary to rebuild it from scratch if necessary


    return True

def delete_site():
    pass