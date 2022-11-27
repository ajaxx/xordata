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

    // --------------------------------------------------------------------------------
    // KeyList
    // --------------------------------------------------------------------------------
    class KeyTile extends React.Component {
        render() {
            const key = this.props.pkey;
            return React.createElement('div', { className: 'column box' },
                React.createElement('div', { className: 'is-flex-grow-5 pb-3' },
                    React.createElement('div', { className: 'control' },
                        React.createElement('div', { className: 'field' },
                            React.createElement('label', { className: 'label' }, 'Key Id'),
                            React.createElement('input', { className: 'input', type: 'text', readOnly: true, value: key.kid })
                        ),
                        React.createElement('div', { className: 'field' },
                            React.createElement('label', { className: 'label' }, 'Public Key'),
                            React.createElement('textarea', { className: 'input', readOnly: true, rows: 6, value: key.key })
                        )
                    )
                ),
                React.createElement('a', { className: 'button is-pulled-right is-small' },
                    React.createElement('i', { className: 'fa-solid fa-trash fa-lg' })
                )
            );
        }
    }

    class KeyTileList extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                isLoaded: false,
                pkeys: []
            }
        }

        componentDidMount() {
            fetch('/api/keys')
                .then(res => res.json())
                .then((res) => {
                    this.setState({
                        isLoaded: true,
                        pkeys: res
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

        renderKeys(pkeys) {
            return React.createElement('div', { className: 'columns is-multiline' },
                pkeys.map(key => React.createElement(KeyTile, { pkey: key, key: key.kid })));
        }

        render() {
            const { error, isLoaded, pkeys } = this.state;
            if (error) {
                // render an error
            } else if (!isLoaded) {
                return this.renderIsLoading();
            } else {
                return this.renderKeys(pkeys);
            }
        }
    }

    const keyList = document.getElementById('key-list');
    if (keyList) {
        ReactDOM
            .createRoot(keyList)
            .render(React.createElement(KeyTileList));
    }

    // --------------------------------------------------------------------------------
    // DocumentList
    // --------------------------------------------------------------------------------

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

    const documentsList = document.getElementById('xordata-documents-list');
    if (documentsList) {
        ReactDOM
            .createRoot(documentsList)
            .render(React.createElement(DocumentTileList));
    }

    // --------------------------------------------------------------------------------
    // DocumentSigner
    // --------------------------------------------------------------------------------

    class DocumentSigner extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                fileMedical: null,
                filePrivateKey: null,
                dataMedical: null,
                signature: null
            }

            this.onSign = this.onSign.bind(this);
            this.onSend = this.onSend.bind(this);
            this.onCancel = this.onCancel.bind(this);
            this.onChangeFileMedical = this.onChangeFileMedical.bind(this);
            this.onChangeFilePrivateKey = this.onChangeFilePrivateKey.bind(this);
        }

        onChangeFilePrivateKey(e) {
            this.setState({
                filePrivateKey: e.target.files[0],
                signature: null
            });
        }

        onChangeFileMedical(e) {
            this.setState({
                fileMedical: e.target.files[0],
                dataMedical: null,
                signature: null
            });
        }

        readAsync(file) {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.addEventListener('load', () => {
                    return resolve(fileReader.result);
                });
                fileReader.readAsText(file);
            });
        }

        readPrivateKey(file) {
            return this.readAsync(file)
                .then(armoredPrivateKey => openpgp.readPrivateKey({ armoredKey: armoredPrivateKey }));
        }

        onSign(e) {
            this.readAsync(this.state.filePrivateKey)
                .then(armoredPrivateKey => openpgp.readPrivateKey({ armoredKey: armoredPrivateKey }))
                .then(privateKey => {
                    return this.readAsync(this.state.fileMedical)
                        .then(dataMedical => {
                            this.setState({ dataMedical : dataMedical });
                            return openpgp.createMessage({ text: dataMedical });
                        })
                        .then(dataMessage => openpgp.sign({ message: dataMessage, signingKeys: privateKey, detached: true, format: 'armored' }))
                        .then(signature => this.setState({ signature : signature }))
                        .then(() => {
                            window.location.href = '/documents';
                        });
                });
        }
        
        onSend(e) {
            const canBeSent = this.state.signature != null && this.state.dataMedical != null;
            const document = {
                section: this.props.section,
                message: this.state.dataMedical,
                signature: this.state.signature
            };

            console.log(JSON.stringify(document));

            axios
                .post('/api/documents', document, { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    console.log('file uploaded');
                    console.log(response);
                    this.setState({ error: null });
                })
                .catch((error) => {
                    console.log('file upload failed');
                    console.log(error);
                    this.setState({ error: error });
                });
        }

        onCancel(e) {
            console.log('currently does nothing');
        }

        renderButtons() {
            const canBeSigned = this.state.fileMedical != null && this.state.filePrivateKey != null;
            const canBeSent = this.state.signature != null && this.state.dataMedical != null;

            return React.createElement("div", { className: "field" },
                React.createElement("button", {
                        id: "action",
                        className: "button is-link",
                        disabled: !canBeSigned,
                        onClick: this.onSign
                    },
                    React.createElement("i", { className: 'fa-solid fa-signature mr-2' }),
                    React.createElement("span", {}, "Sign")
                ),
                React.createElement("button", {
                        id: "action",
                        className: "button is-link ml-2",
                        disabled: !canBeSent,
                        onClick: this.onSend
                    },
                    React.createElement("i", { className: 'fa-solid fa-share mr-2' }),
                    React.createElement("span", {}, "Send")
                ),
                React.createElement("button", { className: "button is-light ml-2", onClick: this.onCancel }, "Cancel")
            );
        }

        render() {
            const signature = this.state.signature || '';
            const section = this.props.section;

            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Section"),
                        React.createElement("input", { type: "text", readOnly: true, value: section, className: "input" })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Medical Document"),
                        React.createElement("input", {
                            type: "file",
                            id: "file-selector-document",
                            accept: ".json",
                            className: "input",
                            onChange: this.onChangeFileMedical
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Private Key File"),
                        React.createElement("input", {
                            type: "file",
                            id: "file-selector-private-key",
                            accept: ".pem",
                            className: "input",
                            onChange: this.onChangeFilePrivateKey
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Signature"),
                        React.createElement("textarea", { id: "document-signature", className: "input", readOnly: true, value: signature, rows: 10 })
                    ),
                    this.renderButtons()
                )
            );
        }
    }

    const documentSigner = document.getElementById('document-signer');
    if (documentSigner) {
        const section = documentSigner.dataset.section;
        ReactDOM
            .createRoot(documentSigner)
            .render(React.createElement(DocumentSigner, { section: section }));
    }
});