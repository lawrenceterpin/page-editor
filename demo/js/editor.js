class Editor {

    editorMode = true;
    editorId = "default";
    jsonDatasUrl = "https://lawrenceterpin.github.io/page-editor/demo/js/datas/datas.json";
    configUrl = "https://lawrenceterpin.github.io/page-editor/demo/js/config.json";

    constructor(options) {

        if (typeof options !== 'undefined') {

            if (typeof options.editorId !== "undefined") {

                this.editorId = options.editorId;
            }
            if (typeof options.jsonDatasUrl !== "undefined") {

                this.jsonDatasUrl = options.jsonDatasUrl;
            }
            if (typeof options.configUrl !== "undefined") {

                this.configUrl = options.configUrl;
            }
            if (typeof options.editorMode !== "undefined") {

                this.editorMode = options.editorMode;
            }
        }

        // Initialisation
        this.loadConfig();
    }

    loadConfig() {

        fetch(this.configUrl)
            .then(response => {

                return response.json();
            })
            .then(data => {

                this.options = data;

                this.loadDatas();
            });
    }

    loadLocalDatas() {

        const datas = localStorage.getItem(this.editorId);

        if (datas !== null) {

            this.editorDatas = JSON.parse(datas);

            this.startEditor();
        }

        return datas;
    }

    loadDatas() {

        const datas = this.loadLocalDatas();

        if (datas == null) {

            fetch(this.jsonDatasUrl)
                .then(response => {
                    return response.json();
                })
                .then(data => {

                    this.editorDatas = data;

                    this.startEditor();
                });
        }
    }

    startEditor() {

        this.container = this.getById(this.options.editorContainerId)

        this.generatePage();

        this.switchEditorMode();

        this.createEditorPanel();
    }

    /**
     * Affichage du formulaire d'édition
     */
    updateEditorFormValues() {

        const typeElement = this.getById("selected-element");
        typeElement.innerText = this.elementSelected.tag + "#" + this.elementSelected.id;

        const formType = this.getById("form-type");
        formType.innerText = ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément');

        this.options.panel.form.fieldsGroups.forEach(group => {

            group.fields.forEach(field => {
                let fieldForm = this.getBySelector('#' + this.formId + ' [name=' + field.name + ']');

                if (this.formType == 'edit') {

                    if (fieldForm.type !== 'radio') {
                        fieldForm.value = this.elementSelected[field.name];
                    }
                    else if (fieldForm.type == 'radio') {

                        field.options.forEach(value => {

                            if (this.elementSelected[field.name] == value) {
                                if (typeof this.getBySelector('#' + this.formId + ' #' + value) !== "undefined") {
                                    let fieldForm = this.getBySelector('#' + this.formId + ' #' + value);

                                    fieldForm.checked = true;
                                }
                            }
                        });
                    }
                }

                if (this.formType == 'add') {

                    this.form.reset();
                }
            });
        });

        this.panelDisplay(true);
    }

    /**
    * Soumission du formulaire d'édition
    * 
    * @param {Object} event 
    */
    submitEditorForm(event) {

        event.preventDefault();

        const tag = this.getBySelector('#' + this.formId + ' #tag').value;

        if (tag !== '') {
            this.getBySelector('#' + this.formId + ' #name').value = tag;

            let data = {};

            this.options.panel.form.fieldsGroups.forEach(group => {

                group.fields.forEach(field => {
                    let value = this.getBySelector('#' + this.formId + ' [name="' + field.name + '"]').value;

                    if (field.type == 'radio') {

                        if (this.getBySelector('#' + this.formId + ' [name="' + field.name + '"]:checked') !== null) {
                            value = this.getBySelector('#' + this.formId + ' [name="' + field.name + '"]:checked').value;
                        }
                    }

                    data[field.name] = value;
                });
            });

            this.panelDisplay(false);

            this.searchElementByValueInArray(this.editorDatas, this.elementSelected.id, data, this.formType);
        }
        else {

            alert('Veuillez renseigner le type');
        }
    }

    /**
     * Création du panneau d'édition
     */
    createEditorPanel() {
        // Création du bouton de changement de mode d'édition
        this.editorModeButton = this.createElement('button');
        this.editorModeButton.setAttribute('id', 'editor-mode-button');
        this.editorModeButton.setAttribute('class', 'p-fixed btn shadow round');
        this.editorModeButton.setAttribute('onclick', 'editor.switchEditorMode()');
        this.editorModeButton.innerHTML = '<i class="fa fa-eye"></i></button>';

        document.body.prepend(this.editorModeButton);

        // Création du panneau
        this.panel = this.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        let content = "<div class='d-flex nowrap justify-content-between'>" +
            "<h2 id='form-type' class='m-0'>" + ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément') + "</h2>" +
            "<button id='close-panel' class='btn shadow bg-primary white' onclick='editor.panelDisplay(false)'><i class='fa fa-close'></i></button>" +
            "</div>" +
            "<h3 id='selected-element'></h3>" +
            "<form id='editor-form' class='d-flex flex-direction-column' onsubmit='editor.submitEditorForm(event)'>";

        content += this.createForm();

        content += "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-primary shadow white'>" +
            "</div>" +
            "</form>";

        this.panel.innerHTML = content;

        document.body.prepend(this.panel);

        // On récupère le formulaire d'édition
        this.form = this.getById("editor-form");
        this.formId = this.form.getAttribute('id');

        this.getSelectedTag();

        // Ouverture/fermeture du panneau d'édition 
        this.panelDisplay(this.options.panel.open);
    }

    /**
     * Affichage du panneau
     * 
     * @param {Boolean} open
     */
    panelDisplay(open) {

        this.options.panel.open = open;

        if (this.options.panel.open == true) {
            // On affiche le panneau
            this.addClass(this.panel, "open");
        }
        else {
            // On cache le panneau
            this.removeClass(this.panel, "open");
        }
    }

    /**
     * Changement du mode d'édition
     */
    switchEditorMode() {

        this.editorMode = (this.editorMode) ? false : true;

        const editor = this.getById('editor');

        editor.className = (this.editorMode == true) ? "" : "editor-mode";

        if (this.editorMode == false) {

            this.generatePage();
        }
        else {

            const editElement = Array.from(document.querySelectorAll('.edit-element-options'));

            for (var i = 0; i < editElement.length; i++) {

                editElement[i].parentNode.removeAttribute('draggable');
                editElement[i].parentNode.removeAttribute('ondragstart');
                editElement[i].parentNode.removeAttribute('ondragover');

                editElement[i].parentNode.removeChild(editElement[i]).remove();
            }
        }
    }

    /**
     * Génération de la page
     */
    generatePage() {

        console.log('page généré');
        console.log(this.container.id, this.editorDatas);

        this.container.innerHTML = "";

        // On ajoute les éléments
        this.createElementsFromArray(this.container, this.editorDatas);
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

            let tagName = (element.tag == 'img') ? 'div' : element.tag;
            // On créé la balise de l'élément
            let tag = this.createElement(tagName);
            // On créé l'identifiant de l'élément
            element.id = parent.id + "-" + element.name + "-" + (index + 1);
            // On ajoute l'identifiant de l'élément
            tag.id = element.id;

            const inlineProperties = ["top", "bottom", "left", "right", "z-index", "font-size"];

            inlineProperties.forEach(property => {

                if (element[property] !== '') {
                    tag.style[property] = element[property];
                }
            });

            tag.className = this.createElementClasses(element);

            tag.setAttribute('draggable', 'true');
            tag.setAttribute('ondragstart', 'editor.dragit(event);');
            tag.setAttribute('ondragover', 'editor.dragover(event);');

            // On ajoute le bouton d'édition
            tag.innerHTML = '<div class="edit-element-options flex-direction-row-reverse p-relative w-100">' +
                '<div id="edit-element-tag" class="p-absolute bg-primary white">' +
                '<b>&nbsp;' + element.tag + '&nbsp;</b>' +
                '</div>' +
                '<div id="edit-element-buttons" class="p-absolute d-none gap-1 nowrap align-items-center">' +
                '<button class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.addElement(\'' + tag.id.trim() + '\')"><i class="fa fa-plus-circle"></i></button>' +
                '<button class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div>' +
                '<button id="edit-element-button" class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.showEditOptions(\'' + tag.id.trim() + '\')"><i class="fa fa-cog"></i></button>' +
                '</div>';

            if (element.tag == 'img') {
                const img = this.createElement('img');

                img.setAttribute('src', element.src);
                this.addClass(img, 'w-100');

                tag.appendChild(img);
            }

            if (element.tag == 'a') {

                tag.setAttribute('href', element.href);
            }

            if (element.text !== '') {
                tag.innerHTML += element.text;
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.createElementsFromArray(tag, element.elements);
            }

            parent.appendChild(tag);
        });

        var rellax = new Rellax('.rellax', {
            center: true,
            vertical: true,
            horizontal: false,
        });
    }

    addElement(elementIdSelected) {

        this.searchElementByValueInArray(this.editorDatas, elementIdSelected, null, 'add');
    }

    editElement(elementIdSelected) {

        this.searchElementByValueInArray(this.editorDatas, elementIdSelected, null, 'edit');
    }

    /**
     * Recherche d'élément par valeur dans un tableau
     * 
     * @param {Array} array 
     * @param {String} elementId 
     * @param {Object} data 
     * @param {String} type 
     */
    searchElementByValueInArray(array, elementId, data, type) {
        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            if (elementId == element.id) {

                this.elementSelected = element;
                this.formType = type;

                if (data !== null) {
                    if (type == 'add') {

                        if (typeof element.elements == "undefined") {
                            element['elements'] = [];
                        }

                        element.elements.push(data);
                    }
                    else if (type == 'edit') {

                        this.options.panel.form.fieldsGroups.forEach(group => {

                            group.fields.forEach(field => {
                                element[field.name] = data[field.name];
                            });
                        });
                    }
                    // On regénère la page
                    this.generatePage();

                    this.saveDatas();
                }
                else {

                    this.updateEditorFormValues();
                }
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.searchElementByValueInArray(element.elements, elementId, data, type);
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

        const editElementButtons = this.getBySelector('#' + elementId + ' #edit-element-buttons');

        this.editOptionsIsOpen = (this.editOptionsIsOpen) ? false : true;

        this.removeClass(editElementButtons, (this.editOptionsIsOpen) ? 'd-none' : 'd-flex');
        this.addClass(editElementButtons, (this.editOptionsIsOpen) ? 'd-flex' : 'd-none');
    }

    accordion(event) {

        const child = event.srcElement.parentNode.children[1];

        if (this.hasClass(child, 'd-none')) {

            this.removeClass(child, 'd-none');
            this.addClass(child, 'd-flex');
        }
        else {

            this.removeClass(child, 'd-flex');
            this.addClass(child, 'd-none');
        }
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
        var className = 'element ';

        // if (element["display"] == '') {

        // className += 'row ';

        flexboxClassesProperties.forEach(property => {

            className += element[property] + ' ';
        });
        //}

        classesProperties.forEach(property => {

            className += element[property] + ' ';
        });

        className = className.trim();

        return className;
    }

    saveDatas() {

        localStorage.setItem(this.editorId, JSON.stringify(this.editorDatas));

        alert('Les données ont été sauvegardées');
    }

    createForm() {

        let content = "";

        this.options.panel.form.fieldsGroups.forEach(group => {

            content += "<div id='" + group.name + "' class='field-group accordion mb-1 pb-1 border-bottom'>" +
                "<h4 class='d-flex justify-content-between m-0' onclick='editor.accordion(event);'><strong>" + group.title + "</strong><i class='fa fa-chevron-down'></i></h4>" +
                "<div class='flex-direction-column justify-content-center pt-1 pb-1 d-none'>";

            group.fields.forEach(field => {

                content += "<label for='" + field.name + "' class='mb-1'>" + field.title + "</label>";

                if (field.type == "text" || field.type == "number") {

                    content += "<input type='" + field.type + "' id='" + field.name + "' name='" + field.name + "' placeholder='" + field.title + "' class='mb-1'>";
                }
                else if (field.type == "hidden") {

                    content += "<input type='" + field.type + "' id='" + field.name + "' name='" + field.name + "' placeholder='" + field.title + "' class='mb-1'>";
                }
                else if (field.type == "radio") {

                    content += "<div class='row flex-direction-row align-items-center gap-1 mb-1'>";

                    field.options.forEach(option => {

                        content += "<input type='radio' id='" + option.value + "' name='" + field.name + "' value='" + option.value + "'>" +
                            "<label for='" + option.value + "' class='d-flex justify-content-center align-items-center " + option.class + "' title='" + option.value + "'>";

                        if (option.iconClass !== '') {

                            content += "<i class='fa " + option.iconClass + "'></i>";
                        }

                        content += "</label>";
                    });

                    content += "</div>";
                }
                else if (field.type == "select") {

                    content += "<select id='" + field.name + "' name='" + field.name + "' class='mb-1'>" +
                        "<option value='' selected>" + field.title + "</option>";

                    field.options.forEach(value => {

                        content += "<option value='" + value + "'>" + value + "</option>";
                    });

                    content += "</select>";
                }
                else if (field.type == "autocompletion") {

                    var search_terms = ['apple', 'apple watch', 'apple macbook', 'apple macbook pro', 'iphone', 'iphone 12'];

                    content += "<input type='" + field.type + "' id='" + field.name + "' name='" + field.name + "' placeholder='" + field.title + "' onKeyUp='showResults(this.value)' class='mb-1'>" +
                        "<div id='result'></div>";

                }
            });

            content += "</div>" +
                "</div>";
        });

        return content;
    }

    getSelectedTag() {

        const tag = this.getBySelector('#' + this.formId + ' #tag');

        tag.addEventListener("change", function () {

        });
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

    autocompleteMatch(input) {
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

    showResults(val) {
        res = document.getElementById("result");
        res.innerHTML = '';
        let list = '';
        let terms = autocompleteMatch(val);
        for (i = 0; i < terms.length; i++) {
            list += '<li>' + terms[i] + '</li>';
        }
        res.innerHTML = '<ul>' + list + '</ul>';
    }
}