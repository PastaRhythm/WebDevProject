import paramiko

command = "ls"

# Update the next three lines with your
# server's information

host = "jacob-t-graham.com"
username = "####"
password = "####"

client = paramiko.client.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password)
_stdin, _stdout,_stderr = client.exec_command(command)
print(_stdout.read().decode())
client.close()