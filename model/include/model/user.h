#ifndef CODECOMPASS_USER_H
#define CODECOMPASS_USER_H

#include <string>

namespace cc
{
namespace model
{

#pragma db object
struct User
{
  #pragma db id not_null
  std::string username;

  #pragma db not_null
  std::string passwordhash;
};
}
}

#endif //CODECOMPASS_USER_H
