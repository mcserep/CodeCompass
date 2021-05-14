include_directories(
  include
  ${CMAKE_CURRENT_BINARY_DIR}
  ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp
  ${PROJECT_SOURCE_DIR}/util/include
  ${PROJECT_SOURCE_DIR}/webserver/include)

include_directories(SYSTEM
  ${THRIFT_LIBTHRIFT_INCLUDE_DIRS})

flex_target(querylexer src/querylexer.lex ${CMAKE_CURRENT_BINARY_DIR}/querylexer.yy.cc)
bison_target(queryparser src/querysyntaxanalyzer.y ${CMAKE_CURRENT_BINARY_DIR}/queryparser.cc)
add_flex_bison_dependency(querylexer queryparser)

add_executable(querylang
        ${BISON_queryparser_OUTPUTS}
        ${FLEX_querylexer_OUTPUTS}
        )

add_custom_command(
  OUTPUT
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_constants.cpp
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_constants.h
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_types.cpp
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_types.h
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/ComprehensionQueryService.cpp
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/ComprehensionQueryService.h
    ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp
  COMMAND
    ${THRIFT_EXECUTABLE} --gen cpp
      -o ${CMAKE_CURRENT_BINARY_DIR}
      ${CMAKE_CURRENT_SOURCE_DIR}/comprehensionquery.thrift
  DEPENDS
    ${CMAKE_CURRENT_SOURCE_DIR}/comprehensionquery.thrift
  COMMENT
    "Generating Thrift for comprehensionquery.thrift")

add_library(comprehensionquerythrift STATIC
  ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_constants.cpp
  ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/comprehensionquery_types.cpp
  ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp/ComprehensionQueryService.cpp)

target_compile_options(comprehensionquerythrift PUBLIC -fPIC)

add_library(comprehensionqueryservice SHARED
  src/comprehensionqueryservice.cpp
  src/plugin.cpp)

target_compile_options(comprehensionqueryservice PUBLIC -Wno-unknown-pragmas)

target_link_libraries(comprehensionqueryservice
  util
  ${THRIFT_LIBTHRIFT_LIBRARIES}
  ${ODB_LIBRARIES}
  comprehensionquerythrift)

install(TARGETS comprehensionqueryservice DESTINATION ${INSTALL_SERVICE_DIR})
