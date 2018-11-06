add_executable(CodeCompass_webserver
  src/webserver.cpp
  src/mainrequesthandler.cpp
  src/threadedmongoose.cpp )

set_target_properties(CodeCompass_webserver
  PROPERTIES ENABLE_EXPORTS 1)

add_library(mongoose STATIC src/mongoose.c )
add_library(mongoose_613 STATIC src/mongoose_613.c )

target_include_directories(mongoose PUBLIC include)
target_compile_options(mongoose PUBLIC -fPIC)
target_include_directories(mongoose_613 PUBLIC include)
target_compile_options(mongoose_613 PUBLIC -fPIC)

target_include_directories(CodeCompass_webserver PUBLIC
  include
  ${PROJECT_SOURCE_DIR}/model/include
  ${PROJECT_SOURCE_DIR}/util/include)

find_boost_libraries(
  filesystem
  log
  program_options
  system
  thread)
target_link_libraries(CodeCompass_webserver
  util
  mongoose
  mongoose_613
  ${Boost_LINK_LIBRARIES}
  ${ODB_LIBRARIES}
  pthread
  dl)

install(TARGETS CodeCompass_webserver
  RUNTIME DESTINATION ${INSTALL_BIN_DIR}
  LIBRARY DESTINATION ${INSTALL_LIB_DIR})
