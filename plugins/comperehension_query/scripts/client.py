import glob
import sys

sys.path.append('gen-py')
sys.path.append('/home/efekane/codecompass/mate_build/service/project/gen-py')

from thrift import Thrift
from thrift.transport import THttpClient
from thrift.protocol import TJSONProtocol

from project import ProjectService

# --- Server information ---#

host = 'localhost'
port = 6252
workspace = 'libgit2'


# --- Create client objects ---#

def create_client(service, service_name):
    """This function initializes the Thrift client and returns the client objects
to the API."""

    path = '/' + workspace + '/' + service_name

    transport = THttpClient.THttpClient(host, port, path)
    protocol = TJSONProtocol.TJSONProtocol(transport)

    return service.Client(protocol)


projectservice = create_client(ProjectService, 'ProjectService')


# --- Do the job ---#

def main():
    #print(comprehensionqueryservice.getComprehensionQueryString())
    print('csirip')
    print(projectservice.getFileTypes())


if __name__ == "__main__":
    main()
