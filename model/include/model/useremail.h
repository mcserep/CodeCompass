#ifndef CODECOMPASS_USEREMAIL_H
#define CODECOMPASS_USEREMAIL_H

#include <string>

namespace cc
{
namespace model
{
#pragma db object
struct File
{
  #pragma db id not_null
  std::string username;

  #pragma db not_null
  std::string email;
};
}
}

#endif //CODECOMPASS_USEREMAIL_H
