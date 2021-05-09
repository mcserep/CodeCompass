#ifndef CC_SERVICE_DUMMY_DUMMYSSERVICE_H
#define CC_SERVICE_DUMMY_DUMMYSSERVICE_H

#include <memory>
#include <vector>

#include <boost/program_options/variables_map.hpp>

#include <odb/database.hxx>
#include <util/odbtransaction.h>
#include <webserver/servercontext.h>

#include <ComprehensionQueryService.h>

namespace cc
{
namespace service
{
namespace comprehensionquery
{

class ComprehensionQueryServiceHandler : virtual public ComprehensionQueryServiceIf
{
public:
  ComprehensionQueryServiceHandler(
    std::shared_ptr<odb::database> db_,
    std::shared_ptr<std::string> datadir_,
    const cc::webserver::ServerContext& context_);

  void getComprehensionQueryString(std::string& str_);

private:
  std::shared_ptr<odb::database> _db;
  util::OdbTransaction _transaction;

  const boost::program_options::variables_map& _config;
};

} // comprehensionquery
} // service
} // cc

#endif // CC_SERVICE_DUMMY_DUMMYSSERVICE_H
