#include <util/util.h>
#include <util/logutil.h>

#include <model/user.h>

#include <regex>
#include <vector>

#include "mainrequesthandler.h"

namespace cc
{
namespace webserver
{

int MainRequestHandler::begin_request_handler(struct mg_connection* conn_)
{
  // We advance ot by one because of the '/' character.
  const std::string& uri = conn_->uri + 1;

  LOG(debug)
    << util::getCurrentDate() << " Connection from " << conn_->remote_ip
    << ':' << conn_->remote_port << " requested URI: " << uri;

  auto handler = pluginHandler.getImplementation(uri);
  if (handler)
    return handler->beginRequest(conn_);

  if (uri.find_first_of("doxygen/") == 0)
  {
    mg_send_file(conn_, getDocDirByURI(uri).c_str());
    return MG_MORE;
  }

  // Returning MG_FALSE tells mongoose that we didn't served the request
  // so mongoose should serve it.
  return MG_FALSE;
}

int MainRequestHandler::checkAuthentication(
  struct mg_connection* conn_)
{
  int result;
  const char* cookie = mg_get_header(conn_, "Cookie");

  if (cookie != NULL)
  {
    std::vector<std::string> cookiePairs;
    char* token = strtok((char*)cookie, "; ");
    cookiePairs.emplace_back(std::string(token));

    while (token != NULL)
    {
      token = strtok((char*)cookie, "; ");
      cookiePairs.emplace_back(std::string(token));
    }

    std::map<std::string, std::string> cookieList;
    for (const auto& pair : cookiePairs)
    {
      char* key = strtok((char*)pair.c_str(), "=");
      char* value = strtok(key, "=");
      cookieList.insert(std::make_pair(key, value));
    }

    if (cookieList.find("username") != cookieList.end())
    {
      util::OdbTransaction transaction(_db);
      transaction([&, this]
      {
        //auto user = _db->query<model::User>(
          //odb::query<model::User>::username.c_str() == cookie);
      });

      return MG_TRUE;
    }

  }

  return MG_FALSE;
}

int MainRequestHandler::operator()(
  struct mg_connection* conn_,
  enum mg_event ev_)
{
  int result;

  switch (ev_)
  {
    case MG_REQUEST:
    {
      const char *cookie = mg_get_header(conn_, "Cookie");

      if (cookie == NULL || strstr(cookie, "cica=yes") == NULL)
      {
        mg_printf(conn_, "HTTP/1.1 200 OK\r\n"
                         "Set-Cookie: cica=yes;\r\n"
                         "content-Type: text/html\r\n\r\n"
                         "Hello!");
        return MG_TRUE;
      }

      return begin_request_handler(conn_);
    }

    case MG_AUTH:
    {
      if (digestPasswdFile.empty())
        return MG_TRUE;

      FILE* fp = fopen(digestPasswdFile.c_str(), "r");
      if (fp) 
      {
        result = mg_authorize_digest(conn_, fp);
        fclose(fp);
        return result;
      }
      else 
      {
        LOG(error)
          << "Password file could not be opened: " << digestPasswdFile;

        // TODO: An internal server error response would be nicer.
        throw std::runtime_error("Password file could not be opened.");
      }
      break;
    }

    default:
      break;
  }

  return MG_FALSE;
}

std::string MainRequestHandler::getDocDirByURI(std::string uri_)
{
  if (uri_.empty())
    return "";

  if (uri_.back() == '/')
    uri_.pop_back();

  std::size_t pos1 = uri_.find('/');
  std::size_t pos2 = uri_.find('/', pos1 + 1);

  std::string ws = uri_.substr(pos1 + 1, pos2 - pos1 - 1);

  std::string file;
  if (pos2 != std::string::npos)
    file = uri_.substr(pos2);

  return dataDir[ws] + "/docs" + file;
}

}
}
