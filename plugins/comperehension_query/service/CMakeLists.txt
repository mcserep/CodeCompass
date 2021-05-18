set(CMAKE_VERBOSE_MAKEFILE on)
include_directories(
  include
  ${CMAKE_CURRENT_BINARY_DIR}
  ${CMAKE_CURRENT_BINARY_DIR}/gen-cpp
  ${PROJECT_SOURCE_DIR}/util/include
  ${PROJECT_SOURCE_DIR}/webserver/include)

include_directories(SYSTEM
  ${THRIFT_LIBTHRIFT_INCLUDE_DIRS})

#============================================================
# ADD_FLEX_BISON_DEPENDENCY (public macro)
#============================================================
#
macro(ADD_FLEX_BISONCPP_DEPENDENCY FlexTarget BisonTarget)

    if(NOT FLEX_${FlexTarget}_OUTPUTS)
        message(SEND_ERROR "Flex target `${FlexTarget}' does not exist.")
    endif()

    if(NOT BISONCPP_${BisonTarget}_OUTPUT_HEADER)
        message(SEND_ERROR "Bisoncpp target `${BisonTarget}' does not exist.")
    endif()

    set_source_files_properties(${FLEX_${FlexTarget}_OUTPUTS}
            PROPERTIES OBJECT_DEPENDS ${BISONCPP_${BisonTarget}_OUTPUT_HEADER})
endmacro()

bisoncpp_target(queryparser src/queryparser.y ${CMAKE_CURRENT_BINARY_DIR}/parse.cc)
add_custom_command(
        OUTPUT
            ${CMAKE_CURRENT_BINARY_DIR}/Parser.ih
        COMMAND
            "sed "
)
#execute_process(COMMAND "${BISONCPP_EXECUTABLE} src/queryparser.y"
#        COMMAND_ECHO STDOUT)
#add_custom_command(
#        OUTPUT
#            ${CMAKE_CURRENT_BINARY_DIR}/Parserbase.h
#            ${CMAKE_CURRENT_BINARY_DIR}/Parser.h
#            ${CMAKE_CURRENT_BINARY_DIR}/Parser.ih
#            ${CMAKE_CURRENT_BINARY_DIR}/parser.cc
#        COMMAND
#            ${BISONCPP_EXECUTABLE}
#        ARGS
#            src/queryparser.y
#        COMMENT
#            "Building bison stuff"
#)

#add_custom_target(run ALL
#        DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Parserbase.h)

flex_target(querylexer src/querylexer.lex ${CMAKE_CURRENT_BINARY_DIR}/querylexer.yy.cc)
add_flex_bisoncpp_dependency(querylexer queryparser)

add_executable(querylang
         src/main.cc
         ${BISONCPP_queryparser_OUTPUTS}
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
