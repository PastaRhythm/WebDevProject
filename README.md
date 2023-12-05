Docker Website Builder

This web app allows users to create websites for their businesses and organizations in a isolated, secure environment powered by docker!

To run and test this app effectively, a few things need to be done:
    
    1. Create hostnames for testing.
    2. Install all dependencies.
    3. Understand database seeding.
    

1. Create hostnames for testing:
   Navigate to the following file: C:\Windows\System32\drivers\etc\hosts
   And paste this text at the bottom:
    
        127.0.0.1 host1.dockertest.internal
        127.0.0.1 host2.dockertest.internal
        127.0.0.1 host3.dockertest.internal
   

    Then save.  Test adding sites using the 3 domains above (host1.dockertest.internal, etc.)

3. Install all dependencies.
    First, install docker desktop.  https://www.docker.com/products/docker-desktop/
    Then, in the root directory of this project, install all depencies with: pip install -r requirements.txt

4. In our app.py file, we have a db seeding function for testing.  At the bottom, in the "if __name__ == "__main__": ...
    block, uncomment the seed_db(app) line.  This will empty the entire database, and insert sample data into the Users
    and Websites table.  The two users are:
    user 1:
        email: billy.bob@gmail.com
        password: testtest
    user 2:
        email: luke.skywalker@gmail.com
        password: theforce

Note that the initial websites inserted in the seeder will not have valid links.  This is expected.
Currently, our site ui is not beautiful.  This is because most of our work was on backend features.
This will improve.  Also, we will obviously be fixing many bugs over the coming weeks.

If there are any questions, let me know.
