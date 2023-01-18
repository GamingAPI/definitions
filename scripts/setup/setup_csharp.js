export function getCsharpConfigFile(asyncapi_file, library_name, repository_url) {
	return `{
	"ASYNCAPI_FILE": "${asyncapi_file}",
	"LIBRARY_NAME": "${library_name}",
	"REPOSITORY_URL": "${repository_url}"
}`
}