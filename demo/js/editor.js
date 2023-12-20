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
            if (typeof options.jsonStyleUrl !== "undefined") {

                this.jsonStyleUrl = options.jsonStyleUrl;
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

                this.loadStyle();
            });
    }

    loadLocalDatas(key) {

        const datas = localStorage.getItem(key);

        return datas;
    }

    loadDatas() {

        const datas = this.loadLocalDatas(this.editorId);

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
        else {

            this.editorDatas = JSON.parse(datas);

            this.startEditor();
        }
    }

    loadStyle() {

        const datas = this.loadLocalDatas(this.editorId + '-style');

        if (datas == null) {

            fetch(this.jsonStyleUrl)
                .then(response => {
                    return response.json();
                })
                .then(data => {

                    this.styleDatas = data;

                    this.createEditorPanel();

                    this.styleInject(data);

                    this.loadDatas();
                });
        }
        else {

            this.styleDatas = JSON.parse(datas);

            this.createEditorPanel();

            this.styleInject(JSON.parse(datas));

            this.loadDatas();
        }
    }

    /**
     * Démarrage de l'éditeur
     * 
     * @param {Object} datas 
     */
    startEditor() {

        this.container = this.getById(this.options.editorContainerId)

        this.generatePage();

        this.switchEditorMode();
    }

    /**
     * MAJ des données du formulaire d'édition
     */
    updateEditorFormValues() {

        if (this.formType == 'edit') {
            // On parcours les groupes de champs
            this.options.panel.form.forEach(form => {

                if (form.id == this.selectedFormId) {
                    form.fieldsGroups.forEach(group => {

                        group.fields.forEach(field => {
                            if (field.type == 'radio') {

                                field.options.forEach(option => {

                                    if (this.elementSelected[field.name] == option.value) {
                                        if (typeof this.getFormField(this.selectedFormId, '#' + option.value) !== "undefined") {
                                            let fieldForm = this.getFormField(this.selectedFormId, '#' + option.value);

                                            console.log(this.selectedFormId, field);

                                            fieldForm.checked = true;
                                        }
                                    }
                                });
                            }
                            else {
                                let fieldForm = this.getFormField(this.selectedFormId, '[name=' + field.name + ']');

                                console.log(fieldForm);

                                if (fieldForm !== null) {

                                    console.log(fieldForm);

                                    fieldForm.value = this.elementSelected[field.name];
                                }
                            }
                        });
                    });
                }
            });
        }

        if (this.formType == 'add') {

            this.form.reset();
        }


        this.panelDisplay(true);
    }

    /**
    * Soumission du formulaire d'édition
    * 
    * @param {Object} event 
    */
    submitEditorForm(event) {

        event.preventDefault();

        this.selectedFormId = event.srcElement.id;

        if (this.selectedFormId == 'element-form') {

            const tag = this.getFormField(this.formId, '#tag').value;

            if (tag !== '') {
                this.getFormField(this.formId, '#name').value = tag;

                let data = {};

                // On parcours les groupes de champs
                this.options.panel.form.forEach(form => {

                    if (form.id == this.selectedFormId) {
                        form.fieldsGroups.forEach(group => {

                            group.fields.forEach(field => {
                                let value = this.getFormField(this.formId, '[name=' + field.name + ']').value;

                                if (field.type == 'radio') {

                                    if (this.getFormField(this.formId, '[name=' + field.name + ']:checked') !== null) {
                                        value = this.getFormField(this.formId, '[name=' + field.name + ']:checked').value;
                                    }
                                }

                                data[field.name] = value;
                            });
                        });
                    }
                });

                this.panelDisplay(false);

                this.searchElementByValueInArray(this.editorDatas, this.elementSelected.id, data, this.formType);
            }
            else {

                // this.searchElementByValueInArray(this.editorDatas, this.elementSelected.id, data, this.formType);
            }
        }
        else {

            alert('ok');
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
            "<h2 id='form-type' class='m-0'>Edition</h2>" +
            "<button id='close-panel' class='btn shadow bg-secondary white' onclick='editor.panelDisplay(false)'><i class='fa fa-times'></i></button>" +
            "</div>";
        // "<h3 id='selected-element' class='bg-primary white text-shadow shadow p-1'></h3>";

        this.options.panel.form.forEach(form => {

            content += this.createForm(form);
        });

        this.panel.innerHTML = content;

        document.body.prepend(this.panel);

        // On récupère le formulaire d'édition
        this.elementForm = this.getById("element-form");
        // this.elementFormId = this.elementForm.getAttribute('id');

        this.styleForm = this.getById("style-form");
        // this.styleFormId = this.styleForm.getAttribute('id');

        // this.getSelectedTag();

        // Ouverture/fermeture du panneau d'édition 
        this.panelDisplay(this.options.panel.open);
    }

    /**
     * Affichage du panneau
     * 
     * @param {Boolean} open
     */
    panelDisplay(open) {

        if (typeof this.panel !== 'undefined') {
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

                this.removeClass(editElement[i].parentNode, 'element');

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
        // On vide l'HTML du container
        this.container.innerHTML = "";

        console.log(this.editorDatas);

        // On créé les éléments
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

            let tagName = (element.tag == 'img' || element.tag == 'a') ? 'div' : element.tag;
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

            if (element.tag !== 'a') {
                tag.className = this.createElementClasses(element);
            }

            tag.setAttribute('draggable', 'true');
            tag.setAttribute('ondragstart', 'editor.dragit(event);');
            tag.setAttribute('ondragover', 'editor.dragover(event);');

            // On ajoute le bouton d'édition
            tag.innerHTML = '<div class="edit-element-options flex-direction-row-reverse p-relative w-100">' +
                '<div id="edit-element-tag" class="p-absolute bg-primary white text-shadow">' +
                '<b>&nbsp;' + element.tag + '&nbsp;</b>' +
                '</div>' +
                '<div id="edit-element-buttons" class="p-absolute d-none gap-1 nowrap align-items-center">' +
                '<button class="d-flex align-items-center justify-content-center btn round bg-white primary shadow" title="#' + tag.id + '" onclick="editor.addElement(\'' + tag.id.trim() + '\')"><i class="fa fa-plus-circle"></i></button>' +
                '<button class="d-flex align-items-center justify-content-center btn round bg-white primary shadow" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div>' +
                '<button id="edit-element-button" class="d-flex align-items-center justify-content-center p-absolute round btn bg-white primary shadow" title="#' + tag.id + '" onclick="editor.showEditOptions(\'' + tag.id.trim() + '\')"><i class="fa fa-cog"></i></button>' +
                '</div>';

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

        var rellax = new Rellax('.rellax', {
            center: true,
            vertical: true,
            horizontal: false,
        });
    }

    addElement(elementIdSelected) {

        this.searchElementByValueInArray(this.editorDatas, elementIdSelected, null, 'add');

        this.selectedFormId = "element-form";

        this.updateEditorFormValues();
    }

    editElement(elementIdSelected) {

        this.searchElementByValueInArray(this.editorDatas, elementIdSelected, null, 'edit');

        this.selectedFormId = "element-form";

        this.updateEditorFormValues();
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
            // Si l'identifiant existe
            if (elementId == element.id) {

                this.elementSelected = element;
                this.formType = type;

                // Si les données ne sont pas vides
                if (data !== null) {
                    if (type == 'add') {

                        if (typeof element.elements == "undefined") {
                            element['elements'] = [];
                        }
                        // On ajoute les données de l'élément
                        element.elements.push(data);
                    }
                    else if (type == 'edit') {
                        // On parcours les groupes de champs
                        this.options.panel.form.forEach(form => {

                            if (form.id == this.selectedFormId) {
                                form.fieldsGroups.forEach(group => {
                                    // On parcours les champs
                                    group.fields.forEach(field => {
                                        // On remplace les données de l'élément
                                        element[field.name] = data[field.name];
                                    });
                                });
                            }
                        });
                    }

                    // On regénère la page
                    this.generatePage();

                    // On enregistre la page
                    this.saveDatas();
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
        localStorage.setItem(this.editorId + "-style", JSON.stringify(this.styleDatas));

        alert('Les données ont été sauvegardées');
    }

    createForm(form) {

        let content = '<form id="' + form.id + '" class="d-flex flex-direction-column" onsubmit="editor.submitEditorForm(event)">';

        form.fieldsGroups.forEach(group => {

            content += "<div id='" + group.name + "' class='accordion border-bottom'>" +
                "<h4 class='d-flex justify-content-between m-0 pt-1 pb-1' onclick='editor.accordion(event);'><strong>" + group.title + "</strong><i class='fa fa-chevron-circle-down fa-1x'></i></h4>" +
                "<div class='flex-direction-column justify-content-center pt-1 d-none'>";

            group.fields.forEach(field => {

                if (field.type !== "hidden") {
                    content += "<label for='" + field.name + "' class='mb-1'>" + field.title + "</label>";
                }

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

                    field.options.forEach(option => {

                        content += "<option value='" + option.value + "'>" + option.value + "</option>";
                    });

                    content += "</select>";
                }
                else if (field.type == "autocompletion") {

                    content += "<input type='text' id='" + field.name + "' name='" + field.name + "' onKeyUp='editor.showResults(\"" + field.options + "\", \"" + field.name + "\", this.value)' placeholder='&#xF002; (Ex: div, ...)'>" +
                        "<div id='autocompetion-result' class='mb-1'></div>";
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

    // getSelectedTag() {

    //     const tag = this.getBySelector('#' + this.formId + ' #tag');

    //     tag.addEventListener("change", function () {

    //     });
    // }

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

    showResults(search_terms, id, val) {

        search_terms = search_terms.split(',');

        var res = document.getElementById("autocompetion-result");
        res.innerHTML = '';
        let list = '';

        let terms = this.autocompleteMatch(search_terms, val);

        if (val == '') {
            terms = search_terms;
        }

        for (var i = 0; i < terms.length; i++) {
            list += '<li onclick="editor.setFieldValue(\'' + id + '\', \'' + terms[i] + '\')" class="d-flex justify-content-center align-items-center bg-white">' + terms[i] + '</li>';
        }
        res.innerHTML = '<ul class="row gap-1 p-1">' + list + '</ul>';
    }

    setFieldValue(fieldId, value) {

        let field = this.getById(fieldId.trim());

        field.value = value;

        var res = document.getElementById("autocompetion-result");
        res.innerHTML = "";
    }

    getFormField(formId, fieldSelector) {

        let field = this.getBySelector('#' + formId + ' ' + fieldSelector);
        return field;
    }

    styleInject(data) {

        const head = document.head || document.getElementsByTagName('head')[0];
        this.style = document.createElement('style');
        this.style.type = 'text/css';
        head.appendChild(this.style);

        data.forEach(selector => {

            let css = selector.tag + "{";

            if (typeof selector['font-family'] !== 'undefined') {
                css += "font-family: " + selector['font-family'] + ";";
            }
            if (typeof selector['font-size'] !== 'undefined') {
                css += "font-size: " + selector['font-size'] + ";";
            }
            if (typeof selector['letter-spacing'] !== 'undefined') {
                css += "letter-spacing: " + selector['letter-spacing'] + ";";
            }
            if (typeof selector['background-color'] !== 'undefined') {
                css += "background-color: " + selector['background-color'] + ";";
            }
            if (typeof selector['color'] !== 'undefined') {
                css += "color: " + selector['color'] + ";";
            }

            css += "}";

            this.searchElementByValueInArray(this.styleDatas, selector['id'], null, 'edit');

            this.selectedFormId = "style-form";

            this.updateEditorFormValues();

            this.style.appendChild(document.createTextNode(css.trim()));
        });
    }
}