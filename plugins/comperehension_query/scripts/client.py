import sys

sys.path.append('gen-py')

from thrift import Thrift
from thrift.transport import THttpClient
from thrift.protocol import TJSONProtocol

from comprehensionquery import ComprehensionQueryService

# --- Server information ---#

host = 'localhost'
port = 6252
workspace = 'proba'


# --- Create client objects ---#

def create_client(service, service_name):
    """This function initializes the Thrift client and returns the client objects
to the API."""

    path = '/' + workspace + '/' + service_name

    transport = THttpClient.THttpClient(host, port, path)
    protocol = TJSONProtocol.TJSONProtocol(transport)

    return service.Client(protocol)


comprehensionqueryservice = create_client(ComprehensionQueryService, 'ComprehensionQueryService')


# --- Do the job ---#

def main():
    print(comprehensionqueryservice.getComprehensionQueryString())


if __name__ == "__main__":
    main()
