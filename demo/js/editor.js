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

                this.createEditorPanel();
            });
    }

    loadDatas() {

        this.container = this.getById(this.options.editorContainerId)

        const editorDatas = localStorage.getItem(this.editorId);

        if (editorDatas == null) {

            fetch(this.jsonDatasUrl)
                .then(response => {
                    return response.json();
                })
                .then(data => {

                    this.editorDatas = data;

                    this.generatePage();
                });
        }
        else {
            this.editorDatas = JSON.parse(editorDatas);

            this.generatePage();
        }
    }

    /**
     * Affichage du formulaire d'édition
     */
    updateEditorFormValues() {

        var typeElement = this.getById("selected-element");
        typeElement.innerText = this.elementSelected.tag + "#" + this.elementSelected.id;

        var formType = this.getById("form-type");
        formType.innerText = ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément');

        this.options.panel.form.fieldsGroups.forEach(group => {

            group.fields.forEach(field => {
                var fieldForm = this.getBySelector('#' + this.formId + ' [name=' + field.name + ']');

                if (this.formType == 'edit') {

                    if (fieldForm.type !== 'radio') {
                        fieldForm.value = this.elementSelected[field.name];
                    }
                    else if (fieldForm.type == 'radio') {

                        field.optionsValues.forEach(value => {

                            if (this.elementSelected[field.name] == value) {
                                if (typeof this.getBySelector('#' + this.formId + ' #' + value) !== "undefined") {
                                    var fieldForm = this.getBySelector('#' + this.formId + ' #' + value);

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

        var typeValue = this.getBySelector('#' + this.formId + ' #tag').value;

        this.getBySelector('#' + this.formId + ' #name').value = typeValue;

        var data = {};

        this.options.panel.form.fieldsGroups.forEach(group => {

            group.fields.forEach(field => {
                var value = this.getBySelector('#' + this.formId + ' [name="' + field.name + '"]').value;

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

        var content = "<div class='d-flex justify-content-between'>" +
            "<h2 id='form-type'>" + ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément') + "</h2>" +
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

        var editor = this.getById('editor');

        editor.className = (this.editorMode == true) ? "" : "editor-mode";
    }

    /**
     * Génération de la page
     */
    generatePage() {

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

            var tagName = (element.tag == 'img') ? 'div' : element.tag;
            // On créé la balise de l'élément
            var tag = this.createElement(tagName);
            // On créé l'identifiant de l'élément
            element.id = parent.id + "-" + element.name + "-" + (index + 1);
            // On ajoute l'identifiant de l'élément
            tag.id = element.id;

            var inlineProperties = ["top", "bottom", "left", "right", "z-index", "font-size"];

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
                '<div id="edit-element-buttons" class="p-absolute d-none gap-1 align-items-center">' +
                '<button class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.addElement(\'' + tag.id.trim() + '\')"><i class="fa fa-plus-circle"></i></button>' +
                '<button class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div>' +
                '<button id="edit-element-button" class="btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.showEditOptions(\'' + tag.id.trim() + '\')"><i class="fa fa-cog"></i></button>' +
                '</div>';

            if (element.tag == 'img') {
                var img = this.createElement('img');

                img.setAttribute('src', element.src);
                this.addClass(img, 'w-100');

                tag.appendChild(img);
            }

            // if (element.tag == 'img') {
            //     var i = this.createElement('i');

            //     tag.appendChild(i);
            // }

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

        if (!this.hasClass(this.shadow, 'edit-element') && (e.target.parentNode.id == this.shadow.parentNode.id)) {

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

        var editElementButtons = this.getBySelector('#' + elementId + ' #edit-element-buttons');

        this.editOptionsIsOpen = (this.editOptionsIsOpen) ? false : true;

        this.removeClass(editElementButtons, (this.editOptionsIsOpen) ? 'd-none' : 'd-flex');
        this.addClass(editElementButtons, (this.editOptionsIsOpen) ? 'd-flex' : 'd-none');
    }

    accordion(event) {

        var child = event.srcElement.parentNode.children[1];

        if (this.hasClass(child, 'd-none')) {

            this.removeClass(child, 'd-none');
            this.addClass(child, 'd-flex');
        }
        else {

            this.removeClass(child, 'd-flex');
            this.addClass(child, 'd-none');
        }
    }

    getIconByName(name) {

        let icon = "";

        if (name == 'justify-content-start') {

            icon = "fa-align-left";
        }
        else if (name == 'justify-content-center') {

            icon = "fa-align-center";
        }
        else if (name == 'justify-content-end') {

            icon = "fa-align-right";
        }
        else if (name == 'justify-content-between') {

            icon = "fa-align-justify";
        }
        else if (name == 'align-items-center') {

            icon = "fa-align-center";
        }
        else if (name == 'align-items-start') {

            icon = "fa-align-left";
        }
        else if (name == 'align-items-end') {

            icon = "fa-align-right";
        }
        else if (name == 'flex-direction-row') {

            icon = "fa-long-arrow-right";
        }
        else if (name == 'flex-direction-row-reverse') {

            icon = "fa-long-arrow-left";
        }
        else if (name == 'flex-direction-column') {

            icon = "fa-long-arrow-down";
        }
        else if (name == 'flex-direction-column-reverse') {

            icon = "fa-long-arrow-up";
        }

        return icon;
    }

    createElementClasses(element) {

        var classesProperties = [
            "display",
            "position",
            "color",
            "background",
            "classes"
        ];

        var flexboxClassesProperties = [
            "flex-direction",
            "justify-content",
            "align-items"
        ];

        // On ajoute la classe de l'élément
        var className = 'element ';

        if (element["display"] == '') {

            className += 'row ';

            flexboxClassesProperties.forEach(property => {

                className += element[property] + ' ';
            });
        }

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

                    field.optionsValues.forEach(value => {

                        var colorClass = "bg-" + value.replace('bg-', '');

                        if (field.name !== 'color' && field.name !== 'background') {

                            var iconClass = this.getIconByName(value);
                        }

                        content += "<input type='radio' id='" + value + "' name='" + field.name + "' value='" + value + "'  class='d-flex align-items-center justify-content-center " + colorClass + " border'>" +
                            "<label for='" + value + "' class='d-flex justify-content-center align-items-center " + colorClass + "' title='" + value + "'><i class='fa " + iconClass + "'></i></label>";
                    });

                    content += "</div>";
                }
                else if (field.type == "select") {

                    content += "<select id='" + field.name + "' name='" + field.name + "' class='mb-1'>" +
                        "<option value='' selected>" + field.title + "</option>";

                    field.optionsValues.forEach(value => {

                        content += "<option value='" + value + "'>" + value + "</option>";
                    });

                    content += "</select>";
                }
            });

            content += "</div>" +
                "</div>";
        });

        return content;
    }

    getSelectedTag() {

        var tag = this.getBySelector('#' + this.formId + ' #tag');

        tag.addEventListener("change", function () {

            alert(tag.value);
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
}