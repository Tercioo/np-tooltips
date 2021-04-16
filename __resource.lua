
resource_manifest_version "44febabe-d386-4d18-afbe-5e627f4af937"

dependencies {
    "np-toolbox",
}

--testing tooltips
client_script	"ttip-client.lua"

ui_page ("html/index.html")
files ({
    'html/index.html',
    'html/index.js',
    'html/css.js',
    'html/index.css',
    'html/reset.css'
})

