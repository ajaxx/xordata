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

    function readAsync(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.addEventListener('load', () => {
                return resolve(fileReader.result);
            });
            fileReader.readAsText(file);
        });
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
                            React.createElement('textarea', { className: 'textarea', readOnly: true, rows: 6, value: key.key })
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
                message: null,
                isLoaded: false,
                isGenerating: false,
                pkeys: [],
                gkey: null
            }

            this.onRequestGenerateKey = this.onRequestGenerateKey.bind(this);
            this.onRequestSaveKey = this.onRequestSaveKey.bind(this);
            this.onCopyPrivateKey = this.onCopyPrivateKey.bind(this);
            this.onCopyPublicKey = this.onCopyPublicKey.bind(this);
        }

        onCopyPrivateKey(e) {
            navigator.clipboard.writeText(this.state.gkey.privateKey);
        }

        onCopyPublicKey(e) {
            navigator.clipboard.writeText(this.state.gkey.publicKey);
        }

        onRequestSaveKey(e) {
            this.setState({ isLoading: true });

            const body = { publicKey: this.state.gkey.publicKey };
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            axios
                .post('/api/keys', body, options)
                .then(response => {
                    this.setState({
                        isLoading: false,
                        gkey: null,
                        message: 'Your new key has been saved'
                    });
                    this.componentDidMount();
                })
                .catch(error => {
                    console.log(error);
                    this.setState({
                        isLoading: false,
                        error: error
                    });
                });
        }

        onRequestGenerateKey(e) {
            this.setState({ isGenerating: true });
            axios
                .post('/api/keys/keypair', {}, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    this.setState({
                        isGenerating: false,
                        gkey: { 
                            publicKey: response.data.publicKey,
                            privateKey: response.data.privateKey
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.setState({
                        isGenerating: false,
                        error: error
                    });
                });
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

        renderKeyGeneration() {
            const buttonClassName = this.state.isGenerating ? 'is-loading' : 'is-primary';
            if (this.state.gkey) {
                return React.createElement('div', null,
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" },
                            React.createElement("div", { className: 'level' },
                                React.createElement("span", { className: 'mr-3' }, "Private Key"),
                                React.createElement("a", { className: 'button', onClick: this.onCopyPrivateKey },
                                    React.createElement("span", { className: "icon is-small" },
                                        React.createElement("i", { className: "fa-solid fa-copy" })
                                    ),
                                )
                            )
                        ),
                        React.createElement("textarea", { className: "textarea", readOnly: true, value: this.state.gkey.privateKey, rows: 10 })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" },
                            React.createElement("div", { className: 'level' },
                                React.createElement("span", { className: 'mr-3' }, "Public Key"),
                                React.createElement("a", { className: 'button', onClick: this.onCopyPublicKey },
                                    React.createElement("span", { className: "icon is-small" },
                                        React.createElement("i", { className: "fa-solid fa-copy" })
                                    ),
                                )
                            )
                        ),
                        React.createElement("div", { className: "control" },
                            React.createElement("textarea", { className: "textarea", readOnly: true, value: this.state.gkey.publicKey, rows: 10 })
                        )
                    ),
                    React.createElement('div', { className: 'buttons' },
                        React.createElement('button', { className: `button ${buttonClassName}`, onClick: this.onRequestGenerateKey }, "Generate (New) Key"),
                        React.createElement('button', { className: `button ml-5 ${buttonClassName}`, onClick: this.onRequestSaveKey }, "Save (Public Key Only)")
                    )
                );
            } else {
                return React.createElement('div', null,
                    React.createElement('div', { className: 'has-info-light mb-4' }, 'You currently have no keys.'),
                    React.createElement('button', { className: `button ${buttonClassName}`, onClick: this.onRequestGenerateKey }, "Generate Key"));
            }
        }

        renderKeys(pkeys) {
            if (pkeys.length != 0) {
                return React.createElement('div', { className: 'columns is-multiline' },
                    pkeys.map(key => React.createElement(KeyTile, { pkey: key, key: key.kid })));
            } else {
                return this.renderKeyGeneration();
            }
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

    class SharedDocumentItem extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {
            const grant = this.props.grant;
            const link = `/documents/view/${grant.oid}/${grant.src_uid}`;

            console.log(this.props.grant);
            return React.createElement('div', { className: 'column is-2' },
                React.createElement('div', { className: 'card' },
                    React.createElement('div', { className: 'card-header' },
                        React.createElement('div', { className: 'card-header-title is-justify-content-space-between' },
                            React.createElement('a', { href: link }, 
                                React.createElement('span', { className: '' }, grant.description)
                            ),
                            React.createElement('div', null,
                                React.createElement('a', { href: link, className: 'is-small is-outlined is-primary' },
                                    React.createElement('i', { className: 'fa-thin fa-files-medical' })
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'card-content' },
                        React.createElement('div', { className: 'is-clipped' }, grant.timestamp),
                        React.createElement('div', { className: 'is-clipped is-ellipsis' }, grant.oid)
                    )
                )
            );
        }
    }

    class SharedDocumentTileList extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                isLoaded: false,
                grants: []
            }
        }

        componentDidMount() {
            fetch('/api/grants/dst')
                .then(async res => {
                    let grants = await res.json();
                    this.setState({
                        isLoaded: true,
                        grants: grants
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoaded: true,
                        error: error
                    });
                });
        }

        renderIsLoading() {
            return React.createElement('div', null, 'Loading ...');
        }

        renderGrantTable() {
            const grants = this.state.grants;
            if (grants == null) {
                return React.createElement('div');
            } else {
                return React.createElement('div', { className: 'columns is-vertical is-multiline' },
                    grants.map(grant => React.createElement(SharedDocumentItem, {
                        key: grant.oid,
                        grant: grant
                    }))
                );
            }
        }

        render() {
            if (this.state.error) {
                // render an error
            } else if (!this.state.isLoaded) {
                return this.renderIsLoading();
            } else {
                return this.renderGrantTable();
            }
        }
    }

    class DocumentMaster extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                activeTab: 'mine',
                document: null,
                documentAccess: null
            }

            this.onSelectMyDocuments = this.onSelectMyDocuments.bind(this);
            this.onSelectSharedDocuments = this.onSelectSharedDocuments.bind(this);
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

        onSelectMyDocuments(e) {
            this.setState({ activeTab: 'mine' });
        }

        onSelectSharedDocuments(e) {
            this.setState({ activeTab: 'shared' });
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
                    React.createElement("li", { className: this.getTabActive('mine') },
                        React.createElement("a", { onClick: this.onSelectMyDocuments },
                            React.createElement("span", { className: "icon is-small" },
                                React.createElement("i", { className: "fa-solid fa-files-medical" })
                            ),
                            React.createElement("span", null, "My Documents")
                        )
                    ),
                    React.createElement("li", { className: this.getTabActive('shared') },
                        React.createElement("a", { onClick: this.onSelectSharedDocuments },
                            React.createElement("span", { className: "icon is-small" },
                                React.createElement("i", { className: "fa-solid fa-share-nodes" })
                            ),
                            React.createElement("span", null, "Shared With You")
                        )
                    ),
                )
            );
        }

        renderContent() {
            if (this.state.document !== null) {
                if (this.state.activeTab == 'mine') {
                    return React.createElement(DocumentTileList, {});
                } else if (this.state.activeTab == 'shared') {
                    return React.createElement(SharedDocumentTileList, {});
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

    const documentsMaster = document.getElementById('documents-master');
    if (documentsMaster) {
        ReactDOM
            .createRoot(documentsMaster)
            .render(React.createElement(DocumentMaster));
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

        readPrivateKey(file) {
            return readAsync(file)
                .then(armoredPrivateKey => openpgp.readPrivateKey({ armoredKey: armoredPrivateKey }));
        }

        onSign(e) {
            readAsync(this.state.filePrivateKey)
                .then(armoredPrivateKey => openpgp.readPrivateKey({ armoredKey: armoredPrivateKey }))
                .then(privateKey => {
                    return readAsync(this.state.fileMedical)
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
                        React.createElement("textarea", { id: "document-signature", className: "textarea", readOnly: true, value: signature, rows: 5 })
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

    class DocumentReviewAtom extends React.Component {
        constructor(props) {
            super(props);
            this.onRequestShareLink = this.onRequestShareLink.bind(this);
        }

        onRequestShareLink(e) {
            window.location.href = `/documents/share/${this.props.document}/${this.props.destination}`
        }

        renderGrant() {
            const grant = this.props.grant;

            return React.createElement('tr', { className: '' },
                React.createElement('td', { className: '' }, grant.dst_uid),
                React.createElement('td', { className: '' }, grant.src_uid),
                React.createElement('td', { className: '' }, grant.timestamp),
                React.createElement('td', { className: '' }, grant.kek),
                React.createElement('a', { className: 'button is-small' },
                    React.createElement('i', { className: 'fa-solid fa-trash fa-lg' })
                )
            );
        }

        renderEmpty() {
            const destination = this.props.destination;
            return React.createElement('tr', { className: '' },
                React.createElement('th', { className: '' }, destination),
                React.createElement('td', { className: '' }),
                React.createElement('td', { className: '' }),
                React.createElement('td', { className: '' }),
                React.createElement('td', { className: '' },
                    React.createElement('a', { className: 'button is-pulled-right is-small', onClick: this.onRequestShareLink },
                        React.createElement('i', { className: 'fa-solid fa-link' })
                    )
                ),
            );
        }

        render() {
            if (this.props.grant) {
                return this.renderGrant();
            } else {
                return this.renderEmpty();
            }
        }
    }

    class DocumentReviewAccess extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                grants: null
            }
        }

        componentDidMount() {
            const oid = this.props.document.oid;
            fetch(`/api/grants/index/${oid}`)
                .then(res => res.json())
                .then(res => {
                    this.setState({ grants: res });
                }, (error) => {
                    this.setState({ error: error });
                });
        }

        renderGrantTable() {
            const grants = this.state.grants;
            if (grants == null) {
                return React.createElement('div');
            } else {
                // Creating the rows for the body is a bit tricky because we need
                // to do a rowspan

                return React.createElement("table", { className: 'table' },
                    React.createElement("thead", { className: '' },
                        React.createElement('tr', { className: '' },
                            React.createElement('th', { className: '' }, 'Consumer'),
                            React.createElement('th', { className: '' }, 'Owner'),
                            React.createElement('th', { className: '' }, 'Timestamp'),
                            React.createElement('th', { className: '' }, 'Grant Key'),
                            React.createElement('th', { className: '' }, 'Actions'),
                        )
                    ),
                    React.createElement("tbody", { className: '' }, 
                        Object.entries(grants).flatMap(entry => {
                            let destination = entry[0];
                            let grants = entry[1];

                            if (grants.length == 0) {
                                return React.createElement(DocumentReviewAtom, {
                                    key: destination,
                                    document: this.props.document.oid,
                                    destination: destination
                                });
                            } else {
                                return grants.map(grant => React.createElement(DocumentReviewAtom, {
                                    key: grant.dst_uid,
                                    document: this.props.document.oid,
                                    grant: grant
                                }));
                            }
                        })
                    )
                );
            }
        }

        render() {
            const oid = this.props.document.oid;
            return React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                    this.renderGrantTable()
                )
            );
        }
    }

    class DocumentReview extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                activeTab: 'properties',
                document: null,
                documentAccess: null
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
                    return React.createElement(DocumentReviewAccess, { document: this.state.document });
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

    // --------------------------------------------------------------------------------
    // DocumentViewer
    // --------------------------------------------------------------------------------
    class DocumentViewer extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                // grant request
                description: null,
                kek: null,
                // message
                encryptedMessage: null,
                cleartextMessage: null,
                // private key
                filePrivateKey: null
            }

            this.onChangeFilePrivateKey = this.onChangeFilePrivateKey.bind(this);
            this.onView = this.onView.bind(this);
        }

        async readPrivateKey() {
            const armoredPrivateKey = await readAsync(this.state.filePrivateKey);
            return await openpgp.readPrivateKey({ armoredKey: armoredPrivateKey });
        }

        async decryptKeK() {
            const privateKey = await this.readPrivateKey();
            const message = await openpgp.readMessage({ armoredMessage: this.state.kek });
            const symkey = await openpgp.decrypt({ message, decryptionKeys: privateKey });
            return symkey.data;
        }

        onView(e) {
            this.decryptKeK().then(async encryptionKeyText => {
                const cipherKey = aesjs.utils.hex.toBytes(encryptionKeyText);
                const encryptedBytes = aesjs.utils.hex.toBytes(this.state.encryptedMessage.cipherText);
                const iv = aesjs.utils.hex.toBytes(this.state.encryptedMessage.iv);
                const aesCbc = new aesjs.ModeOfOperation.cbc(cipherKey, iv);
                const decryptedBytes = aesCbc.decrypt(encryptedBytes);
                const decryptedText = new TextDecoder().decode(decryptedBytes);
                this.setState({
                    cleartextMessage: decryptedText
                });
            })
            .catch((error) => {
                console.log(error);
                this.setState({ error: error });
            });
        }

        onChangeFilePrivateKey(e) {
            this.setState({
                filePrivateKey: e.target.files[0]
            });
        }

        componentDidMount() {
            fetch(`/api/documents/${this.props.documentId}/${this.props.destinationUser}`)
                .then(async res => {
                    let response = await res.json();
                    let document = response.document;
                    let grant = response.grant;
                    this.setState({
                        kek: grant.kek,
                        description: document.description,
                        encryptedMessage: document.message,
                     });
                }, (error) => {
                    this.setState({ error: error });
                });
        }

        renderButtons() {
            const canBeViewed =
                this.state.kek &&
                this.state.encryptedMessage &&
                this.state.filePrivateKey;

            return React.createElement("div", { className: "field" },
                React.createElement("button", {
                        id: "action",
                        className: "button is-link ml-2",
                        disabled: !canBeViewed,
                        onClick: this.onView
                    },
                    React.createElement("span", {}, "View")
                ),
                React.createElement("a", { className: "button is-light ml-2", href: `/documents` }, "Cancel")
            );
        }

        render() {
            const isCleartextHidden = this.state.cleartextMessage == null ? 'is-hidden' : '';

            return React.createElement("div", { className: '' },
                React.createElement("div", { className: "column" },
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "File Description"),
                        React.createElement("input", {
                            type: "text",
                            readOnly: true,
                            className: "input",
                            value: this.state.description || ''
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Your Private Key"),
                        React.createElement("input", {
                            type: "file",
                            accept: ".pem",
                            className: "input",
                            onChange: this.onChangeFilePrivateKey
                        }),
                    ),
                    React.createElement("div", { className: `field ${isCleartextHidden}` },
                        React.createElement("textarea", {
                            className: "textarea",
                            readOnly: true,
                            rows: 15,
                            value: this.state.cleartextMessage || ''
                        })
                    ),
                    this.renderButtons()
                )
            );
        }
    }
 
    const documentViewer = document.getElementById('document-viewer');
    if (documentViewer) {
        ReactDOM
            .createRoot(documentViewer)
            .render(React.createElement(DocumentViewer, {
                documentId: documentViewer.dataset.documentId,
                destinationUser: documentViewer.dataset.destinationUser
            }));
    }

    // --------------------------------------------------------------------------------
    // GrantBuilder
    // --------------------------------------------------------------------------------
    class GrantBuilder extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                // grant request
                destination: null,
                description: null,
                kek: null,
                // private key
                filePrivateKey: null
            }

            this.onChangeFilePrivateKey = this.onChangeFilePrivateKey.bind(this);
            this.onSend = this.onSend.bind(this);
        }

        async readPrivateKey() {
            const armoredPrivateKey = await readAsync(this.state.filePrivateKey);
            return await openpgp.readPrivateKey({ armoredKey: armoredPrivateKey });
        }

        async decryptKeK() {
            const privateKey = await this.readPrivateKey();
            const message = await openpgp.readMessage({ armoredMessage: this.state.kek });
            const symkey = await openpgp.decrypt({ message, decryptionKeys: privateKey });
            return symkey.data;
        }

        onSend(e) {
            this.decryptKeK().then(async encryptionKeyText => {
                const destinationKeys = await openpgp.readKey({ armoredKey: this.state.destination.key });
                const encryptionKeyMessage = await openpgp.createMessage({ text: encryptionKeyText });
                const encryptionKeyEncrypted = await openpgp.encrypt({
                    message: encryptionKeyMessage,
                    encryptionKeys: destinationKeys
                });

                const grant = {
                    dst_uid: this.props.destinationUser,
                    oid: this.props.documentId,
                    kek: encryptionKeyEncrypted
                }

                const response = await axios.post('/api/documents/share', grant, { headers: { 'Content-Type': 'application/json' } });

                this.setState({ error: null });
                window.location.href = '/documents';
            })
                .catch((error) => {
                    console.log('file upload failed');
                    console.log(error);
                    this.setState({ error: error });
                });
        }

        onChangeFilePrivateKey(e) {
            this.setState({
                filePrivateKey: e.target.files[0]
            });
        }

        componentDidMount() {
            fetch(`/api/documents/share/${this.props.documentId}/${this.props.destinationUser}`)
                .then(res => res.json())
                .then(res => {
                    this.setState({
                        kek: res.kek,
                        description: res.description,
                        destination: res.destination
                    });
                }, (error) => {
                    this.setState({ error: error });
                });
        }

        renderButtons() {
            const canBeSent =
                this.state.kek &&
                this.state.description &&
                this.state.destination &&
                this.state.filePrivateKey;

            return React.createElement("div", { className: "field" },
                React.createElement("button", {
                    id: "action",
                    className: "button is-link ml-2",
                    disabled: !canBeSent,
                    onClick: this.onSend
                },
                    React.createElement("i", { className: 'fa-solid fa-share mr-2' }),
                    React.createElement("span", {}, "Share")
                ),
                React.createElement("a", { className: "button is-light ml-2", href: `/documents` }, "Cancel")
            );
        }

        render() {
            let destination = null;
            if (this.state.destination == null) {
                destination = '';
            } else {
                destination = `${this.state.destination.uid} / ${this.state.destination.user}`
            }

            return React.createElement("div", { className: '' },
                React.createElement("div", { className: "column" },
                    React.createElement("p", { className: "has-text-danger" },
                        "You are granting permissions for the designated party to read the document below."
                    )
                ),
                React.createElement("div", { className: "column" },
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "File Description"),
                        React.createElement("input", {
                            type: "text",
                            readOnly: true,
                            className: "input",
                            value: this.state.description || ''
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Consuming Counterparty"),
                        React.createElement("input", {
                            type: "text",
                            readOnly: true,
                            className: "input",
                            value: destination
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Encrypted Cipher Key"),
                        React.createElement("textarea", {
                            className: "textarea",
                            readOnly: true,
                            rows: 6,
                            value: this.state.kek || ''
                        })
                    ),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "Private Key"),
                        React.createElement("input", {
                            type: "file",
                            accept: ".pem",
                            className: "input",
                            onChange: this.onChangeFilePrivateKey
                        })
                    ),
                    this.renderButtons()
                )
            );
        }
    }

    const grantBuilder = document.getElementById('grant-builder');
    if (grantBuilder) {
        ReactDOM
            .createRoot(grantBuilder)
            .render(React.createElement(GrantBuilder, {
                documentId: grantBuilder.dataset.documentId,
                destinationUser: grantBuilder.dataset.destinationUser
            }));
    }
});