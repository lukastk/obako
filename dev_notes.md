
# Internal module dependencies

```mermaid
graph

ui-components --> notes
ui-components --> task-utils
ui-components --> note-loader

plugin-components --> notes
plugin-components --> ui-components
plugin-components --> task-utils
plugin-components --> note-loader

plugin --> plugin-components
plugin --> ui-components

note-loader --> notes

settings --> plugin-components
settings --> ui-components

task-utils --> note-loader

notes -.->|"dynamic imports"| ui-components
```

