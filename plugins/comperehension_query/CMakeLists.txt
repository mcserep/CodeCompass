find_package(FLEX REQUIRED)
find_package(Bisonc++ REQUIRED)

include_directories(${CMAKE_CURRENT_BINARY_DIR})
add_subdirectory(service)
