class Editor {
    // Url des données en json
    jsonDatasUrl = "https://lawrenceterpin.github.io/page-editor/demo/js/datas/datas.json";
    // Url de la config en jsons
    configUrl = "https://lawrenceterpin.github.io/page-editor/demo/js/config.json";

    /**
     * Constructeur
     * 
     * @param {Object} options options personnalisées
     */
    constructor(options) {
        // Si l'objet d'options personnalisées existe
        if (typeof options !== 'undefined') {
            // Propriétés des options personnalisées
            let optionsProperties = ["editorId", "jsonDatasUrl", "jsonStyleUrl", "configUrl", "editorMode"];
            // Pour chaque propriété d'otpion personnalisée
            optionsProperties.forEach(property => {
                // Si la propriété existe
                if (typeof options[property] !== "undefined") {
                    // On ajoute la propriété dans la classe
                    this[property] = options[property];
                }
            });
        }

        // Chargement de la configuration
        this.loadConfig();
    }

    /**
     * Chargement de la configuration
     */
    async loadConfig() {
        // Reponse http
        const reponse = await fetch(this.configUrl);
        // Récupération des données en JSON
        const data = await reponse.json();
        // Enregistrement de la configuration
        this.config = data;

        // Création du panneau de l'éditeur
        this.createEditorPanel();

        // Chargement du style
        this.loadStyle();
    }

    /**
     * Chargement des données locales
     * 
     * @param {String} key 
     */
    loadLocalDatas(key) {
        // Récupération des données locales
        const localDatas = localStorage.getItem(key);
        // On parse en JSON les données locales
        const datas = JSON.parse(localDatas);

        return datas;
    }

    /**
     * Récupération du style
     */
    async loadStyle() {
        // Récupération des données locales
        let datas = this.loadLocalDatas(this.editorId + '-style');
        // Si il n'y a pas de données locales
        if (!datas) {
            // Reponse http
            const reponse = await fetch(this.jsonStyleUrl);
            // Récupération des données en JSON
            datas = await reponse.json();
        }

        this.styleDatas = datas;

        // Injection de la CSS
        this.styleInject(this.styleDatas);
        // Chargement des données
        this.loadDatas();
    }

    /**
     * Chargement des données
     */
    async loadDatas() {
        // Récupération des données locales
        const datas = this.loadLocalDatas(this.editorId);
        // Si il n'y a pas de données locales
        if (!datas) {
            // Reponse http
            const reponse = await fetch(this.jsonDatasUrl);
            // Récupération des données en JSON
            datas = await reponse.json();
        }
        // Données de l'éditeur
        this.editorDatas = datas;
        // Démarrage de l'éditeur
        this.startEditor();
    }

    /**
     * Démarrage de l'éditeur
     */
    startEditor() {
        // Récupération du conteneur de la page éditable
        this.container = this.getById(this.config.editorContainerId)
        // Génération de la page éditable
        this.generatePage();

        this.switchEditorMode();
    }

    /**
     * MAJ des données du formulaire d'édition
     */
    setFormFieldsValues(selectedFormId, formType, elementSelected) {

        this.formType = formType;
        this.selectedFormId = selectedFormId;

        this.getById('element-form').style.display = "none";
        this.getById('style-form').style.display = "none";

        this.getById(selectedFormId).style.display = "block";

        if (this.formType === 'edit') {
            const selectedForm = this.config.panel.form.find(form => form.id === selectedFormId);
            // On parcours chaque groupe de champs
            selectedForm.fieldsGroups.forEach(group => {
                // On parcours chaque champ
                group.fields.forEach(field => {
                    // Si le champ est de type radio
                    if (field.type === 'radio') {
                        const option = field.options.find(option => option.value === elementSelected[field.name]);
                        if (option) {
                            const selectorField = `#${group.name} #${option.value}`;
                            const fieldForm = this.getFormField(selectedFormId, selectorField);
                            fieldForm.checked = true;
                        }
                    } else {

                        const selectorField = `#${group.name} [name=${field.name}]`;
                        const fieldForm = this.getFormField(selectedFormId, selectorField);

                        if (this.selectedFormId === 'style-form' && elementSelected.id === group.name) {

                            fieldForm.value = elementSelected[field.name];

                        } else if (this.selectedFormId !== 'style-form') {

                            fieldForm.value = elementSelected[field.name];
                        }
                    }
                });
            });

        } else if (this.formType === 'add') {
            // On vide les champs du formulaire
            this.getById(selectedFormId).reset();
        }

        this.panelDisplay(true);
    }

    /**
    * Soumission du formulaire d'édition
    * 
    * @param {Object} event 
    */
    submitEditorForm(event) {
        // On bloque le chargement de la page
        event.preventDefault();

        // this.selectedFormId = event.srcElement.id;

        if (this.selectedFormId == 'element-form') {

            const tag = this.getFormField(this.selectedFormId, '#tag').value;

            if (tag !== '') {
                this.getFormField(this.selectedFormId, '#name').value = tag;

                let data = {};

                let formId = this.selectedFormId;

                let form = this.config.panel.form.find(function (form) {
                    return form.id == formId;
                });

                // On parcours les groupes de champs
                form.fieldsGroups.forEach(group => {

                    group.fields.forEach(field => {
                        const fieldSelector = `[name=${field.name}]`;
                        const formField = this.getFormField(this.selectedFormId, fieldSelector);

                        let value = formField.value;

                        if (field.type === 'radio') {
                            const checkedRadio = this.getFormField(this.selectedFormId, `${fieldSelector}:checked`);
                            value = checkedRadio?.value ?? value;
                        }

                        data[field.name] = value;
                    });
                });

                this.panelDisplay(false);

                this.updateDatas(this.editorDatas, this.elementSelected.id, data);
            }
        }
        else {

            let formId = this.selectedFormId;

            let form = this.config.panel.form.find(function (form) {
                return form.id == formId;
            });

            let data = [];

            // On parcours les groupes de champs
            form.fieldsGroups.forEach(group => {

                let groupField = {};

                group.fields.forEach(field => {
                    const fieldSelector = `#${group.name} [name=${field.name}]`;
                    const formField = this.getFormField(this.selectedFormId, fieldSelector);

                    let value = formField.value;

                    if (field.type === 'radio') {
                        const checkedRadio = this.getFormField(this.selectedFormId, `${fieldSelector}:checked`);
                        value = checkedRadio?.value ?? value;
                    }

                    groupField[field.name] = value;
                });

                data.push(groupField);
            });

            this.styleDatas = data;

            this.saveDatas();

            this.style.remove();

            this.styleInject(data);

            this.panelDisplay(false);
        }
    }

    // Function to create an element with attributes
    createElementWithAttributes(tag, attributes) {
        const element = document.createElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    /**
     * Création du panneau d'édition
     */
    createEditorPanel() {
        // Création du bouton de changement de mode d'édition
        this.editorModeButton = this.createElementWithAttributes('button', {
            id: 'editor-mode-button',
            class: 'p-fixed btn shadow round',
            onclick: 'editor.switchEditorMode()'
        });

        this.editorModeButton.innerHTML = '<i class="fa fa-eye"></i>';

        document.body.prepend(this.editorModeButton);

        // Création du panneau
        this.panel = this.createElementWithAttributes('div', {
            id: 'editor-panel',
            class: 'p-fixed shadow p-1',
        });

        this.panel.innerHTML = `<div class="d-flex nowrap justify-content-between">
            <h2 id="form-type" class="m-0">Edition</h2>
            <button id="close-panel" class="btn shadow bg-secondary white" onclick="editor.panelDisplay(false)"><i class="fa fa-times"></i></button>
            </div>`;

        this.config.panel.form.forEach(form => {

            this.panel.innerHTML += this.createForm(form);
        });

        document.body.prepend(this.panel);

        // Ouverture/fermeture du panneau d'édition 
        this.panelDisplay(this.config.panel.open);
    }

    /**
     * Affichage du panneau
     * 
     * @param {Boolean} open
     */
    panelDisplay(open) {

        this.config.panel.open = open;

        const action = open ? 'add' : 'remove';
        // On modifie la classe du panneau
        this[action + 'Class'](this.panel, 'open');
    }

    /**
     * Changement du mode d'édition
     */
    switchEditorMode() {

        this.editorMode = !this.editorMode;

        const editor = this.getById('editor');
        editor.className = this.editorMode ? '' : 'editor-mode';

        if (!this.editorMode) {
            this.generatePage();
        }
        else {

            const editElements = Array.from(document.querySelectorAll('.edit-element-options'));

            for (const element of editElements) {
                const parent = element.parentNode;

                parent.classList.remove('element');
                parent.removeAttribute('draggable ondragstart ondragover');
                parent.removeChild(element);
            }
        }
    }

    /**
     * Génération de la page
     */
    generatePage() {
        // On vide l'HTML du container
        this.container.innerHTML = "";

        // On créé les éléments
        this.createElementsFromArray(this.container, this.editorDatas);

        var rellax = new Rellax('.rellax', {
            center: true,
            vertical: true,
            horizontal: false,
        });
    }

    /**
     * Création d'éléments à partir d'un tableau
     * 
     * @param {HTMLElement} parent 
     * @param {Array} array 
     */
    createElementsFromArray(parent, array) {
        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            const tagName = (element.tag === 'img' || element.tag === 'a') ? 'div' : element.tag;
            // Création de l'identifiant de l'élément
            const elementId = `${parent.id}-${element.name}-${index + 1}`;
            element.id = elementId;

            let classes;

            if (element.tag !== 'a') {
                classes = this.createElementClasses(element);
            }

            let tag = this.createElementWithAttributes(tagName, {
                id: elementId,
                class: classes,
                draggable: 'true',
                ondragstart: 'editor.dragit(event);',
                ondragover: 'editor.dragover(event);'
            });

            const inlineProperties = ["top", "bottom", "left", "right", "z-index", "font-size"];

            inlineProperties.forEach(property => {

                if (element[property] !== '') {
                    tag.style[property] = element[property];
                }
            });

            // On ajoute le menu d'édition
            tag.innerHTML = `<div class="edit-element-options flex-direction-row-reverse p-relative w-100">
                <div id="edit-element-tag" class="p-absolute bg-primary white text-shadow">
                <b>&nbsp;${element.tag}&nbsp;</b>
                </div>
                <div id="edit-element-buttons" class="p-absolute d-none gap-1 nowrap align-items-center">
                <button class="d-flex align-items-center justify-content-center btn round bg-white primary shadow" title="#${tag.id}" onclick="editor.openElementForm(\'${tag.id.trim()}\', 'add')">
                <i class="fa fa-plus-circle"></i>
                </button>
                <button class="d-flex align-items-center justify-content-center btn round bg-white primary shadow" title="#${tag.id}" onclick="editor.openElementForm(\'${tag.id.trim()}\', 'edit')">
                <i class="fa fa-edit"></i>
                </button>
                </div>
                <button id="edit-element-button" class="d-flex align-items-center justify-content-center p-absolute round btn bg-white primary shadow" title="#${tag.id}" onclick="editor.showEditOptions(\'${tag.id.trim()}\')">
                <i class="fa fa-cog"></i>
                </button>
                </div>`;

            if (element.tag == 'img') {
                const img = this.createElement('img');

                img.setAttribute('src', element.src);
                this.addClass(img, 'w-100');

                tag.appendChild(img);
            }

            if (element.tag == 'a') {

                const a = this.createElement('a');

                a.className = this.createElementClasses(element);
                a.setAttribute('href', element.href);
                a.innerHTML += element.text;

                tag.appendChild(a);
            }

            if (element.tag !== 'a') {
                if (element.text !== '') {
                    tag.innerHTML += element.text;
                }
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.createElementsFromArray(tag, element.elements);
            }

            parent.appendChild(tag);
        });
    }

    openElementForm(elementIdSelected, formType) {

        this.searchElementInArray(this.editorDatas, 'id', elementIdSelected);

        this.setFormFieldsValues("element-form", formType, this.elementSelected);
    }

    /**
     * Recherche d'élément par valeur dans un tableau
     * 
     * @param {Array} array 
     * @param {String} key 
     * @param {String} value 
     */
    searchElementInArray(array, key, value) {

        array.forEach(element => {

            if (element[key] == value) {

                this.elementSelected = element;
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {

                this.searchElementInArray(element.elements, key, value);
            }
        });
    }

    updateDatas(datas, elementIdSelected, data) {

        datas.forEach(element => {

            if (element.id == elementIdSelected) {

                if (this.formType === 'add') {
                    element.elements = element.elements || [];
                    element.elements.push(data);
                } else if (this.formType === 'edit') {
                    const form = this.config.panel.form.find(form => form.id === this.selectedFormId);

                    if (form) {
                        // On parcours chaque goupe de champ
                        form.fieldsGroups.forEach(group => {
                            // On parcours chaque champ
                            group.fields.forEach(field => {
                                element[field.name] = data[field.name];
                            });
                        });
                    }
                }

                // On regénère la page
                this.generatePage();
                // On enregistre la page
                this.saveDatas();
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {

                this.updateDatas(element.elements, elementIdSelected, data);
            }
        });
    }

    dragit(event) {
        this.shadow = event.target;
    }

    dragover(e) {
        let children = Array.from(e.target.parentNode.children);

        if (!this.hasClass(this.shadow, 'edit-element') &&
            (e.target.parentNode.id == this.shadow.parentNode.id)) {

            setTimeout(() => {
                // if (e.target.id !== this.shadow.id) {
                // console.log(children.indexOf(e.target), children.indexOf(this.shadow));

                if (children.indexOf(e.target) > children.indexOf(this.shadow))
                    e.target.after(this.shadow);
                else e.target.before(this.shadow);

            }, 500);
        }
    }

    showEditOptions(elementId) {
        const editElementButtons = this.getBySelector(`#${elementId} #edit-element-buttons`);

        this.editOptionsIsOpen = !this.editOptionsIsOpen;

        editElementButtons.classList.toggle('d-none', this.editOptionsIsOpen);
        editElementButtons.classList.toggle('d-flex', !this.editOptionsIsOpen);
    }

    accordion(event) {
        const child = event.currentTarget.parentNode.children[1];
        const isHidden = this.hasClass(child, 'd-none');

        child.classList.replace(isHidden ? 'd-none' : 'd-flex', isHidden ? 'd-flex' : 'd-none');
    }

    createElementClasses(element) {
        const classesProperties = [
            "display",
            "position",
            "text-align",
            "color",
            "background",
            "classes"
        ];

        const flexboxClassesProperties = [
            "flex-direction",
            "justify-content",
            "align-items"
        ];

        // On ajoute la classe de l'élément
        const className = `element ${flexboxClassesProperties.map(property => element[property]).join(' ')} ${classesProperties.map(property => element[property]).join(' ')}`;

        return className.trim();
    }

    saveDatas() {

        localStorage.setItem(this.editorId, JSON.stringify(this.editorDatas));
        localStorage.setItem(this.editorId + "-style", JSON.stringify(this.styleDatas));

        // alert('Les données ont été sauvegardées');
    }

    createForm(formDatas) {

        let content = `<form id="${formDatas.id}" class="d-flex flex-direction-column" onsubmit="editor.submitEditorForm(event)">`;

        formDatas.fieldsGroups.forEach(group => {

            content += `<div id="${group.name}" class="accordion border-bottom">
                <h4 class="d-flex justify-content-between m-0 pt-1 pb-1" onclick="editor.accordion(event);">
                    <strong>${group.title}</strong>
                    <i class="fa fa-chevron-circle-down fa-1x"></i>
                </h4>
                <div class="flex-direction-column justify-content-center pt-1 d-none">`;

            group.fields.forEach(field => {

                if (field.type !== "hidden") {
                    content += `<label for="${field.name}" class="mb-1">${field.title}</label>`;
                }

                switch (field.type) {
                    case "text":
                    case "number":
                    case "hidden":
                        content += `<input type="${field.type}" id="${field.name}" name="${field.name}" placeholder="${field.title}" class="mb-1">`;
                        break;

                    case "radio":
                        content += `<div class="row flex-direction-row align-items-center gap-1 mb-1">`;
                        field.options.forEach(option => {
                            content += `<input type="radio" id="${option.value}" name="${field.name}" value="${option.value}">
                            <label for="${option.value}" class="d-flex justify-content-center align-items-center ${option.class}" title="${option.value}">`;

                            if (option.iconClass !== '') {

                                content += `<i class="fa ${option.iconClass}"></i>`;
                            }

                            content += `</label>`;
                        });
                        content += `</div>`;
                        break;

                    case "select":
                        content += `<select id="${field.name}" name="${field.name}" class="mb-1">
                                        <option value="" selected>${field.title}</option>`;
                        field.options.forEach(option => {
                            content += `<option value="${option.value}">${option.value}</option>`;
                        });
                        content += `</select>`;
                        break;

                    case "autocompletion":
                        content += `<input type="text" id="${field.name}" name="${field.name}" onKeyUp='editor.showResults("${field.options}", "${field.name}", this.value)' placeholder='&#xF002; (Ex: div, ...)'>
                                    <div id='autocompletion-result' class='mb-1'></div>`;
                        break;
                }
            });

            content += "</div>" +
                "</div>";
        });

        content += "<div class='text-center mt-1'>" +
            "<input type='submit' value='ENREGISTRER' class='btn bg-primary black shadow white'>" +
            "</div>" +
            "</form>"

        return content;
    }

    hasClass(element, string) {

        return element.classList.contains(string);
    }

    addClass(element, string) {

        element.classList.add(string);
    }

    removeClass(element, string) {

        element.classList.remove(string);
    }

    createElement(tag) {

        return document.createElement(tag);
    }

    getBySelector(selectors) {

        return document.querySelector(selectors);
    }

    getById(id) {

        return document.getElementById(id);
    }

    autocompleteMatch(search_terms, input) {

        if (input == '') {
            return [];
        }
        var reg = new RegExp(input)
        return search_terms.filter(function (term) {
            if (term.match(reg)) {
                return term;
            }
        });
    }

    showResults(searchTerms, id, val) {

        searchTerms = searchTerms.split(',');

        const res = document.getElementById("autocompletion-result");
        res.innerHTML = '';

        let list = '';

        const terms = val === '' ? searchTerms : this.autocompleteMatch(searchTerms, val);

        for (const term of terms) {
            list += `<li onclick="editor.setFieldValue('${id}', '${term}')" class="d-flex justify-content-center align-items-center bg-white">
                ${term}
            </li>`;
        }

        res.innerHTML = `<ul class="row gap-1 p-1">${list}</ul>`;
    }

    setFieldValue(fieldId, value) {

        let field = this.getFormField(this.selectedFormId, `#${fieldId}`);

        field.value = value;

        var res = document.getElementById("autocompletion-result");
        res.innerHTML = "";
    }

    getFormField(formId, fieldSelector) {

        const field = this.getBySelector(`#${formId} ${fieldSelector}`);
        return field;
    }

    styleInject(data) {
        // Récupération du head du document
        const head = document.head || document.getElementsByTagName('head')[0];
        // Création de la balise <style>
        this.style = document.createElement('style');
        this.style.type = 'text/css';
        head.appendChild(this.style);

        // Liste des propriétés CSS
        const properties = ['font-family', 'font-size', 'letter-spacing', 'text-decoration', 'background-color', 'color'];

        data.forEach(selector => {

            let css = `${selector.tag} {`;

            properties.forEach(property => {

                if (typeof selector[property] !== 'undefined') {
                    css += `${property}: ${selector[property]}; `;
                }
            });

            css += `}`;

            this.setFormFieldsValues("style-form", "edit", selector);

            this.style.appendChild(document.createTextNode(css.trim()));
        });
    }
}