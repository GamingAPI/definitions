
export function getTypeScriptConfigFile(asyncapi_file, repo, repo_description) {
	return `{
	"ASYNCAPI_FILE": "${asyncapi_file}",
	"REPOSITORY_NAME": "${repo}",
	"REPOSITORY_DESCRIPTION": "${repo_description}",
}`;
}