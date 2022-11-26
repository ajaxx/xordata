'use strict';

document.addEventListener('DOMContentLoaded', function () {
    // Dropdowns
    var $dropdowns = getAll('.dropdown:not(.is-hoverable)');
    if ($dropdowns.length > 0) {
        $dropdowns.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                event.stopPropagation();
                $el.classList.toggle('is-active');
            });
        });

        document.addEventListener('click', function (event) {
            closeDropdowns();
        });
    }

    function closeDropdowns() {
        $dropdowns.forEach(function ($el) {
            $el.classList.remove('is-active');
        });
    }

    // Close dropdowns if ESC pressed
    document.addEventListener('keydown', function (event) {
        var e = event || window.event;
        if (e.keyCode === 27) {
            closeDropdowns();
        }
    });

    // Functions
    function getAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    // documentList
    class DocumentUploader extends React.Component {
        constructor(props) {
            super(props);
            this.onFileChange = this.onFileChange.bind(this);
            this.state = {
                error: null,
                isUploading: false
            };
        }

        onFileChange(e) {
            console.log('onFileChange');

            const selectedFile = e.target.files[0];

            // Create an object of formData
            const formData = new FormData();

            formData.append("section", this.props.section.key);
            formData.append("dataFile", selectedFile, selectedFile.name);

            // Request made to the backend api
            // Send formData object
            this.setState({
                isUploading: true
            });

            axios
                .post('/api/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
                .then((response) => {
                    console.log('file uploaded');
                    console.log(response);
                    this.setState({
                        isUploading: false,
                        error: null
                    });
                })
                .catch((error) => {
                    console.log('file upload failed');
                    console.log(error);
                    this.setState({
                        isUploading: false,
                        error: error
                    });
                });
        }

        render() {
            return React.createElement('div', null,
                React.createElement('label', { className: 'is-small' },
                    React.createElement('i', { className: 'fa-solid fa-plus' }),
                    React.createElement('input', { type: 'file', hidden: true, accept: '.json', onChange: this.onFileChange })
                )
            );
        }
    }

    class DocumentTile extends React.Component {
        renderCardHeader(section) {
            return React.createElement('div', { className: 'card-header' },
                React.createElement('p', { className: 'card-header-icon' },
                    React.createElement('i', { className: `fa-solid ${section.icon}` })
                ),
                React.createElement('div', { className: 'card-header-title is-justify-content-space-between' },
                    React.createElement('span', { id: `${section.title}` }, section.title),
                    React.createElement(DocumentUploader, { section: section })
                )
            );
        }

        renderCardContent(section) {
            return React.createElement('div', { className: 'card-content' });
        }

        render() {
            const section = this.props.section;
            return React.createElement('div', { className : 'column', key : section.name },
                React.createElement('div', { className : 'card' },
                    this.renderCardHeader(section),
                    this.renderCardContent(section)
                )
            );
        }
    }
    class DocumentTileList extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                isLoaded: false,
                sections: []
            }
        }

        componentDidMount() {
            fetch('/api/sections')
                .then(res => res.json())
                .then((res) => {
                    this.setState({
                        isLoaded: true,
                        sections: res.sections
                    });
                }, (error) => {
                    this.setState({
                        isLoaded: true,
                        error: error
                    });
                });
        }

        renderIsLoading() {
            return React.createElement('div', null, 'Loading ...');
        }

        renderSections(sections) {
            return React.createElement('div', { className : 'columns is-multiline' },
                sections.map(section => React.createElement(DocumentTile, { section: section, key : section.key })));
        }

        render() {
            const { error, isLoaded, sections } = this.state;
            if (error) {
                // render an error
            } else if (!isLoaded) {
                return this.renderIsLoading();
            } else {
                return this.renderSections(sections);
            }
        }
    }

    const domDocumentsList = document.getElementById('xordata-documents-list');
    if (domDocumentsList) {
        ReactDOM
            .createRoot(domDocumentsList)
            .render(React.createElement(DocumentTileList));
    }
});