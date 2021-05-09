#include <service/comprehensionqueryservice.h>
#include <util/dbutil.h>

namespace cc
{
namespace service
{
namespace comprehensionquery
{

ComprehensionQueryServiceHandler::ComprehensionQueryServiceHandler(
  std::shared_ptr<odb::database> db_,
  std::shared_ptr<std::string> /*datadir_*/,
  const cc::webserver::ServerContext& context_)
    : _db(db_), _transaction(db_), _config(context_.options)
{
}

void ComprehensionQueryServiceHandler::getComprehensionQueryString(std::string& str_)
{
  str_ = _config["comprehensionquery-result"].as<std::string>();
}

} // comprehensionquery
} // service
} // cc
