class Editor {

    configUrl = "https://lawrenceterpin.github.io/page-editor/js/config.json";

    constructor(options) {

        // if (typeof options !== 'undefined') {
        //     this.options = options;
        // }

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

                this.editorMode();

                this.createEditorPanel();
            });
    }

    loadDatas() {

        this.container = document.getElementById(this.options.editorContainerId)

        fetch(this.options.jsonDatasUrl)
            .then(response => {
                return response.json();
            })
            .then(data => {

                this.editorDatas = data;

                this.generatePage();
            });
    }

    /**
     * Affichage du formulaire d'édition
     */
    updateEditorFormValues() {

        var typeElement = document.getElementById("selected-element");
        typeElement.innerText = "élément: " + this.elementSelected.tag + "#" + this.elementSelected.id;

        var formType = document.getElementById("form-type");
        formType.innerText = ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément');

        this.options.panel.form.fields.forEach(field => {

            var field = document.querySelector('#' + this.form.getAttribute('id') + ' #' + field.name);

            if (this.formType == 'edit') {
                if (typeof this.elementSelected[field.name] !== 'undefined') {
                    field.value = this.elementSelected[field.name];
                }
            }
            else if (this.formType == 'add') {

                field.value = "";
            }
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

        var typeValue = document.querySelector('#' + this.form.getAttribute('id') + ' #tag').value;

        document.querySelector('#' + this.form.getAttribute('id') + ' #name').value = typeValue;

        var data = {};

        this.options.panel.form.fields.forEach(field => {

            var value = document.querySelector('#' + this.form.getAttribute('id') + ' #' + field.name).value;

            data[field.name] = value;
        });

        this.panelDisplay(false);

        this.searchElementByValueInArray(this.editorDatas, this.elementSelected.id, data, this.formType);
    }

    /**
     * Création du panneau d'édition
     */
    createEditorPanel() {
        // Création du bouton de changement de mode d'édition
        this.editorModeButton = document.createElement('button');
        this.editorModeButton.setAttribute('id', 'editor-mode-button');
        this.editorModeButton.setAttribute('class', 'p-absolute btn shadow round');
        this.editorModeButton.setAttribute('onclick', 'editor.editorMode()');

        this.editorModeButton.innerHTML = '<i class="fa fa-eye"></i></button>';

        document.body.prepend(this.editorModeButton);

        // Création du panneau
        this.panel = document.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        var content = "<div class='p-relative'>" +
            "<button id='close-panel' class='btn shadow bg-purple white p-absolute' onclick='editor.panelDisplay(false)'><i class='fa fa-close'></i></button>" +
            "</div>" +
            "<h2 id='form-type'>" + ((this.formType == 'add') ? 'Ajouter l\'élément' : 'Modifier l\'élément') + "</h2>" +
            "<h3 id='selected-element'></h3>" +
            "<form id='editor-form' class='d-flex flex-direction-column'>";

        this.options.panel.form.fields.forEach(field => {

            // var label = "<label for='" + field.name + "'>" + field.title + "</label>";

            // if (field.type !== "hidden") {
            //     content += label;
            // }

            if (field.type == "text" || field.type == "hidden") {

                // var input = "<div class='input-group accordion'>" +
                //     "<h4>" + field.title + "&nbsp;<i class='fa fa-chevron-down'></i></h4>" +
                //     "<div>";

                var input = "<input type='" + field.type + "' id='" + field.name + "' name='" + field.name + "' placeholder='" + field.title + "' class='mb-1'>";

                // input += "</div>" +
                //     "</div>";

                content += input;

            }
            else if (field.type == "picker") {

                var input = "<div class='input-group accordion mb-1 border-bottom'>" +
                    "<label for='" + field.name + "' class='d-flex justify-content-between'><h4 class='m-0'>" + field.title + "</h4><i class='fa fa-chevron-down'></i></label>" +
                    // "<h4>" + field.title + "&nbsp;<i class='fa fa-chevron-down'></i></h4>" +
                    "<div class='p-1'>";

                input += "<input type='hidden' id='" + field.name + "' name='" + field.name + "' placeholder='" + field.title + "' class='mb-1'>";

                content += input;

                var picker = "<ul class='colors-grid d-flex mb-1'>";

                field.optionsValues.forEach(value => {

                    var colorClass = value.replace('bg-', '');
                    colorClass = "bg-" + colorClass;

                    picker += "<li class='d-flex align-items-center justify-content-center " + colorClass + " border' onclick='editor.editFieldValue(\"" + field.name + "\", \"" + value + "\")'>";

                    if (field.name !== 'color' && field.name !== 'background') {

                        var iconClass = this.getIconByName(value);

                        picker += "<i class='fa " + iconClass + "'></i>";
                    }

                    picker += "</li>";

                });

                picker += "</ul>";
                picker += "</div>" +
                    "</div>";

                content += picker;
            }
            else if (field.type == "select") {

                var select = "<select id='" + field.name + "' name='" + field.name + "' class='mb-1'>" +
                    "<option selected>Type</option>";

                field.optionsValues.forEach(value => {

                    select += "<option value='" + value + "'>" + value + "</option>";
                });

                select += "</select>";

                content += select;
            }
        });

        content += "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-purple shadow white'>" +
            "</div>" +
            "</form>";

        this.panel.innerHTML = content;

        document.body.prepend(this.panel);

        // On récupère le formulaire d'édition d'élément
        this.form = document.getElementById("editor-form");

        this.form.addEventListener('submit', () => this.submitEditorForm(event), false);

        // Ouverture/fermeture du panneau d'édition 
        this.panelDisplay(this.options.panel.open);

        this.accordion();
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
            this.panel.classList.add("open");
        }
        else {
            // On cache le panneau
            this.panel.classList.remove("open");
        }
    }

    /**
     * Changement du mode d'édition
     */
    editorMode() {

        this.options.editorMode = (this.options.editorMode) ? false : true;

        var editor = document.getElementById('editor');

        editor.className = (this.options.editorMode == true) ? "" : "editor-mode";
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
     * @param {Object} parent 
     * @param {Array} array 
     */
    createElementsFromArray(parent, array) {
        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            var tag = (element.tag == 'img') ? 'div' : element.tag;
            // On créé la balise de l'élément
            var tag = document.createElement(tag);
            // On créé l'identifiant de l'élément
            element.id = parent.id + "-" + element.name + "-" + (index + 1);
            // On ajoute l'identifiant de l'élément
            tag.id = element.id;

            tag.className = 'element';

            console.log(element['flex-direction'], element['justify-content']);

            if ((typeof element['flex-direction'] !== 'undefined' && element['flex-direction'] !== '') ||
                (typeof element['justify-content'] !== 'undefined' && element['justify-content'] !== '')) {

                tag.className += ' row';
            }

            if (element.classes !== '') {

                tag.className += ' ' + element.classes;
            }

            // On ajoute la classe de l'élément
            tag.className += ' ' + element['flex-direction'] + ' ' + element['justify-content'] + ' ' + element.color + ' ' + element.background;
            tag.className = tag.className.trim();

            tag.setAttribute('draggable', 'true');
            tag.setAttribute('ondragstart', 'editor.dragit(event);');
            tag.setAttribute('ondragover', 'editor.dragover(event);');

            // On ajoute le bouton d'édition
            tag.innerHTML = '<div class="edit-element-options p-relative w-100">' +
                '<div id="edit-element-tag" class="p-absolute bg-purple white">' +
                '<b>&nbsp;' + element.tag + '&nbsp;</b>' +
                '</div>' +
                '<div id="edit-element-buttons" class="p-absolute d-none gap-1 align-items-center">' +
                '<button class="btn bg-white purple shadow" title="#' + tag.id + '" onclick="editor.addElement(\'' + tag.id.trim() + '\')"><i class="fa fa-plus-circle"></i></button>' +
                '<button class="btn bg-white purple shadow" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div>' +
                '<button id="edit-element-button" class="btn bg-white purple shadow" title="#' + tag.id + '" onclick="editor.showEditOptions(\'' + tag.id.trim() + '\')"><i class="fa fa-cog"></i></button>' +
                '</div>';

            if (element.tag == 'img') {
                var img = document.createElement('img');

                img.setAttribute('src', element.attributes);
                img.setAttribute('class', 'w-100');

                tag.appendChild(img);
            }

            if (typeof element.text !== 'undefined') {
                tag.innerHTML += element.text;
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.createElementsFromArray(tag, element.elements);
            }

            parent.appendChild(tag);
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

                        this.options.panel.form.fields.forEach(field => {

                            element[field.name] = data[field.name];
                        });
                    }

                    // On regénère la page
                    this.generatePage();
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

        if (this.shadow.className !== 'edit-element p-relative w-100' && (e.target.parentNode.id == this.shadow.parentNode.id)) {

            setTimeout(() => {

                // if (e.target.id !== this.shadow.id) {
                // console.log(children.indexOf(e.target), children.indexOf(this.shadow));

                if (children.indexOf(e.target) > children.indexOf(this.shadow))
                    e.target.after(this.shadow);
                else e.target.before(this.shadow);

            }, 500);
            //}
        }
        // else {

        //     if (typeof e.target.children[1] == 'undefined') {

        //         e.target.appendChild(this.shadow);
        //     }
        // }
    }

    showEditOptions(elementId) {

        var editElementButtons = document.querySelector('#' + elementId + ' #edit-element-buttons');

        this.editOptionsIsOpen = (this.editOptionsIsOpen) ? false : true;

        editElementButtons.classList.remove((this.editOptionsIsOpen) ? 'd-none' : 'd-flex');
        editElementButtons.classList.add((this.editOptionsIsOpen) ? 'd-flex' : 'd-none');
    }

    accordion() {

        var acc = Array.from(document.querySelectorAll(".accordion > label"));

        for (var i = 0; i < acc.length; i++) {

            acc[i].addEventListener("click", function (e) {

                var panel = e.target.parentNode.children[1];

                if (panel.style.display !== "none") {
                    panel.style.display = "flex";

                    return;
                }

                // console.log(panel.style.display);

                // if (panel.style.display == "none") {
                //     panel.style.display = "none";

                //     return;
                // }

                // if (panel.style.display == 'flex') {
                //     panel.style.display = "none";
                // }


            });
        }
    }

    editFieldValue(fieldName, value) {

        document.querySelector('#' + this.form.getAttribute('id') + ' #' + fieldName).type = "text";
        document.querySelector('#' + this.form.getAttribute('id') + ' #' + fieldName).value = value;
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
}