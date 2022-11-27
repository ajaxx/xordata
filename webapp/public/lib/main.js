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

    class DocumentElement extends React.Component {
        render() {
            const document = this.props.document;
            return React.createElement('tr', null,
                React.createElement('td', null,
                    React.createElement('i', { className: `fa-solid fa-file` })),
                React.createElement('td', null,
                    React.createElement('a', { href: `/documents/${document.oid}` },
                        React.createElement('span', null, document.description))));
        }
    }

    class DocumentTile extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                isLoaded: false,
                documents: []
            }
        }

        componentDidMount() {
            fetch(`/api/documents?section=${this.props.section.key}`)
                .then(res => res.json())
                .then((res) => {
                    this.setState({
                        isLoaded: true,
                        documents: res.documents
                    });
                }, (error) => {
                    this.setState({
                        isLoaded: true,
                        error: error
                    });
                });
        }

        renderUploadLink(section) {
            return React.createElement('div', null,
                React.createElement('a', { className: 'button is-small is-outlined is-primary', href: `/documents/upload?section=${section.key}` },
                    React.createElement('i', { className: 'fa-solid fa-plus' }),
                )
            );
        }

        renderCardHeader(section) {
            return React.createElement('div', { className: 'card-header' },
                React.createElement('p', { className: 'card-header-icon' },
                    React.createElement('i', { className: `fa-solid ${section.icon}` })
                ),
                React.createElement('div', { className: 'card-header-title is-justify-content-space-between' },
                    React.createElement('span', { id: `${section.title}` }, section.title),
                    this.renderUploadLink(section)
                )
            );
        }

        renderCardContent(section) {
            const documents = this.state.documents || [];
            return React.createElement('div', { className: 'card-content columns is-mobile is-centered' },
                React.createElement('div', { className : 'column' },
                    React.createElement('table', { className : 'table' },
                        React.createElement('tbody', null,
                            documents.map(document => React.createElement(DocumentElement, { key : document.oid, document : document }))
                        )
                    )
                )
            );
        }

        render() {
            const section = this.props.section;
            return React.createElement('div', { className : 'column is-5', key : section.name },
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
            return React.createElement('div', { className : 'columns is-vertical is-multiline' },
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
                description: null,
                fileMedical: null,
                filePrivateKey: null,
                dataMedical: null,
                signature: null
            }

            this.onSign = this.onSign.bind(this);
            this.onSend = this.onSend.bind(this);
            this.onChangeFileMedical = this.onChangeFileMedical.bind(this);
            this.onChangeFilePrivateKey = this.onChangeFilePrivateKey.bind(this);
            this.onChangeDescription = this.onChangeDescription.bind(this);
        }

        onChangeDescription(e) {
            this.setState({
                description: e.target.value
            });
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
                        .then(signature => this.setState({ signature : signature }));
                });
        }
        
        onSend(e) {
            const document = {
                section: this.props.section,
                message: this.state.dataMedical,
                signature: this.state.signature,
                description: this.state.description
            };

            axios
                .post('/api/documents', document, { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    console.log('file uploaded');
                    console.log(response);
                    this.setState({ error: null });
                    window.location.href = '/documents';
                })
                .catch((error) => {
                    console.log('file upload failed');
                    console.log(error);
                    this.setState({ error: error });
                });
        }

        renderButtons() {
            const canBeSigned = this.state.fileMedical != null && this.state.filePrivateKey != null;
            const canBeSent = this.state.signature != null && this.state.dataMedical != null && this.state.description != null;

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
                React.createElement("a", { className: "button is-light ml-2", href : `/documents` }, "Cancel")
            );
        }

        render() {
            const description = this.state.description || '';
            const signature = this.state.signature || '';
            const section = this.props.section;

            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Section"),
                        React.createElement("input", { type: "text", readOnly: true, value: section, className: "input" })
                    ),
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Description"),
                        React.createElement("input", {
                            className: "input", 
                            type: "text",
                            value: description,
                            placeholder: 'A descriptive name for this document',
                            onChange: this.onChangeDescription
                        })
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

    // --------------------------------------------------------------------------------
    // DocumentReview
    // --------------------------------------------------------------------------------

    class DocumentReview extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                activeTab: 'properties',
                document: null
            }

            this.onSelectProperties = this.onSelectProperties.bind(this);
            this.onSelectAccessControls = this.onSelectAccessControls.bind(this);
            this.onSelectAudit = this.onSelectAudit.bind(this);
        }

        componentDidMount() {
            fetch(`/api/documents/${this.props.documentId}`)
                .then(res => res.json())
                .then(res => {
                    this.setState({ document: res.document });
                }, (error) => {
                    this.setState({ error: error });
                });
        }

        onSelectProperties(e) {
            this.setState({ activeTab: 'properties' });
        }

        onSelectAccessControls(e) {
            this.setState({ activeTab: 'access' });
        }

        onSelectAudit(e) {
            this.setState({ activeTab: 'audit' });
        }

        getTabActive(tab) {
            if (tab == this.state.activeTab) {
                return 'is-active';
            } else {
                return '';
            }
        }

        renderTabs() {
            return React.createElement("div", { className: "tabs" },
                React.createElement("ul", null,
                    React.createElement("li", { className: this.getTabActive('properties') },
                        React.createElement("a", { onClick: this.onSelectProperties },
                            React.createElement("span", { className: "icon is-small" },
                                React.createElement("i", { className: "fa-solid fa-gear" })
                            ),
                            React.createElement("span", null, "Properties")
                        )
                    ),
                    React.createElement("li", { className: this.getTabActive('access') },
                        React.createElement("a", { onClick: this.onSelectAccessControls },
                            React.createElement("span", { className: "icon is-small" },
                                React.createElement("i", { className: "fa-solid fa-lock" })
                            ),
                            React.createElement("span", null, "Access Controls")
                        )
                    ),
                    React.createElement("li", { className: this.getTabActive('audit') },
                        React.createElement("a", { onClick: this.onSelectAudit },
                            React.createElement("span", { className: "icon is-small" },
                                React.createElement("i", { className: "fa-solid fa-clock" })
                            ),
                            React.createElement("span", null, "Audit")
                        )
                    )
                )
            );
        }

        renderContentProperties() {
            const oid = this.state.document.oid;
            const description = this.state.document.description;
            const section = this.state.document.section;
            const timestamp = this.state.document.timestamp;

            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Document Id"),
                        React.createElement("input", {
                            type: "text", 
                            readOnly: true, 
                            value: oid, 
                            className: "input"
                        })
                    ),
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Section"),
                        React.createElement("input", {
                            type: "text",
                            readOnly: true,
                            value: section,
                            className: "input"
                        })
                    ),
                    React.createElement("div", { className: "field" }, " ",
                        React.createElement("label", { className: "label" }, "Description"),
                        React.createElement("input", {
                            className: "input",
                            type: "text",
                            value: description,
                            readOnly: true,
                            placeholder: 'A descriptive name for this document',
                            onChange: this.onChangeDescription
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Timestamp"),
                        React.createElement("input", {
                            className: "input",
                            type: "text",
                            readOnly: true,
                            value: timestamp
                        })
                    )
                )
            );
        }

        renderContentAccess() {
            const oid = this.state.document.oid;
            const description = this.state.document.description;
            const section = this.state.document.section;

            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                )
            );
        }

        renderContentAudit() {
            const oid = this.state.document.oid;
            const description = this.state.document.description;
            const section = this.state.document.section;

            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                )
            );
        }

        renderContent() {
            if (this.state.document !== null) {
                if (this.state.activeTab == 'properties') {
                    return this.renderContentProperties();
                } else if (this.state.activeTab == 'access') {
                    return this.renderContentAccess();
                } else if (this.state.activeTab == 'audit') {
                    return this.renderContentAudit();
                }
            }

            return null;
        }

        render() {
            return React.createElement('div', null,
                this.renderTabs(),
                this.renderContent());
        }
    }

    const documentReview = document.getElementById('document-review');
    if (documentReview) {
        const documentId = documentReview.dataset.documentId;
        ReactDOM
            .createRoot(documentReview)
            .render(React.createElement(DocumentReview, { documentId : documentId }));
    }
});