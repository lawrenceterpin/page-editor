class Editor {
    // Options de la classe Editor
    options = {
        editorMode: true,
        panel: {
            open: false,
        }
    }

    tags = ["div", "h2", "h3", "h4", "ul", "li"];

    pageElements = [
        {
            "tag": "ul",
            "name": "row",
            "classes": "row element",
            "elements": [
                {
                    "tag": "li",
                    "name": "col",
                    "classes": "col-lg-6",
                    "elements": [
                        {
                            "tag": "div",
                            "name": "div",
                            "classes": "m-1 element",
                            "elements": [
                                {
                                    "tag": "h2",
                                    "name": "h2",
                                    "classes": "purple element",
                                    "text": "hello :)"
                                }
                            ]
                        }
                    ]
                },
                {
                    "tag": "li",
                    "name": "col",
                    "classes": "col-lg-6",
                    "elements": [
                        {
                            "tag": "div",
                            "name": "div",
                            "classes": "m-1 element",
                            "elements": [
                                {
                                    "tag": "h2",
                                    "name": "h2",
                                    "classes": "purple element",
                                    "text": "hello :)"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
    
    constructor(options) {

        if (typeof options !== 'undefined') {
            this.options = options;
        }
        // Initialisation
        this.init();
    }

    /**
     * Initialisation
     */
    init() {

        // const loadFile = () => {
        //     //CORS URL
        //     let corsURL = 'https://cors-anywhere.herokuapp.com/';

        //     //My File URL
        //     let myURL = '/Users/lawrenceterpin/Documents/projects/editor/js/datas.json  ';

        //     fetch(myURL, { mode: 'no-cors' })
        //         .then(response => {
        //             console.log(response);
        //         })
        //         .then(content => {
        //             console.log(content);
        //         })
        // }

        // loadFile();

        // fetch("datas.json")
        //     .then(response => {
        //         return response.json();
        //     })
        //     .then(data => console.log(data));

        this.generatePage('page', this.pageElements);

        var addElementButton = document.getElementById('add-element-button');

        var data = {
            "tag": "li",
            "id": "col",
            "classes": "col-lg-6",
            "elements": [{
                "tag": "div",
                "id": "div",
                "classes": "m-1 element",
                "elements": [{
                    "tag": "h2",
                    "id": "h2",
                    "classes": "purple element",
                    "text": "hello :)"
                }]
            }]
        };

        addElementButton.addEventListener('click', () => this.addElement('row-1', data), false);

        this.changeEditorMode();

        this.createPanel();

        // On récupère le formulaire d'édition d'élément
        this.editElementForm = document.getElementById("edit-element-form");
        // Soumission du formulaire d'édition d'élément
        this.editElementForm.addEventListener('submit', () => this.saveEditorForm('edit', event), false);

        // On récupère le formulaire d'ajout d'élément
        this.addElementForm = document.getElementById("add-element-form");
        // Soumission du formulaire d'ajout d'éléments
        this.addElementForm.addEventListener('submit', () => this.saveEditorForm('add', event), false);

        // Ouverture/fermeture du panneau d'édition
        this.panelDisplay(this.options.panel.open);

        var closePanelButton = document.getElementById('close-panel');

        closePanelButton.addEventListener('click', () => this.panelDisplay(false), false);

        // On récupère le bouton de changement de mode
        this.editorModeButton = document.getElementById('editor-mode-button');
        // Au clic du bouton de changement de mode
        this.editorModeButton.addEventListener('click', () => this.changeEditorMode(), false);
    }

    /**
     * Mise à jour des données du formulaire d'édition
     * 
     * @param {*} type 
     * @param {*} parentElementId 
     */
    updateEditorFormData(type, parentElementId) {

        this.parentElement = document.getElementById(parentElementId);
        this.idElementSelected = this.parentElement.id;

        var typeElement = document.getElementById("selected-element");
        typeElement.innerText = this.parentElement.tagName.toLowerCase() + "#" + this.parentElement.id + "." + this.parentElement.className;

        if (type == 'edit') {

            document.querySelector('#' + this.editElementForm.getAttribute('id') + ' #type').value = this.parentElement.tagName.toLowerCase();
            document.querySelector('#' + this.editElementForm.getAttribute('id') + ' #id').value = this.parentElement.id;
            document.querySelector('#' + this.editElementForm.getAttribute('id') + ' #classes').value = this.parentElement.classList;
            // document.querySelector('#' + this.editElementForm.getAttribute('id') + ' #text').value = this.parentElement.innerText;

            this.addElementForm.className = 'd-none flex-direction-column';
            this.editElementForm.className = 'd-flex flex-direction-column';
        }
        else if (type == 'add') {
            this.editElementForm.className = 'd-none flex-direction-column';
            this.addElementForm.className = 'd-flex flex-direction-column';
        }

        this.panelDisplay(true);
    }

    saveEditorForm(type, event) {

        event.preventDefault();

        var form = (type == 'edit') ? this.editElementForm : this.addElementForm;
        var typeValue = document.querySelector('#' + form.getAttribute('id') + ' #type').value;

        var idValue = document.querySelector('#' + form.getAttribute('id') + ' #id').value;
        var sizeValue = document.querySelector('#' + form.getAttribute('id') + ' #size').value;
        var marginValue = document.querySelector('#' + form.getAttribute('id') + ' #margin').value;
        var paddingValue = document.querySelector('#' + form.getAttribute('id') + ' #padding').value;
        var bgColorValue = document.querySelector('#' + form.getAttribute('id') + ' #bg-color').value;
        var colorValue = document.querySelector('#' + form.getAttribute('id') + ' #color').value;
        var classesValue = document.querySelector('#' + form.getAttribute('id') + ' #classes').value;

        var textValue = document.querySelector('#' + form.getAttribute('id') + ' #text').value;

        var elementSelected = this.parentElement;

        if (type == 'edit') {

            var data = {
                "tag": typeValue,
                "id": idValue,
                "classes": classesValue,
                "text": textValue
            };

            this.updateElementData(idValue, data, this.pageElements);
        }
        else if (type == 'add') {
            // On créé le nouvel élément
            var elementToAdd = document.createElement(typeValue);
            elementToAdd.id = idValue;
            elementToAdd.className = "element p-relative " + classesValue + " " + sizeValue + " " + colorValue + " " + bgColorValue;
            elementToAdd.innerHTML = '<div class="edit-element p-absolute">' +
                '<button class="bg-white btn shadow" onclick="editor.updateEditorFormData(\'edit\', \'' + elementToAdd.id + '\')">&nbsp;<i class="fa fa-edit"></i>&nbsp;</button>' +
                '</div>' +
                '<div class="add-element p-absolute d-flex justify-content-center">' +
                '<button class="btn shadow bg-white black" onclick="editor.updateEditorFormData(\'add\', \'' + elementToAdd.id + '\')">&nbsp;<i class="fa fa-plus"></i>&nbsp;</button>' +
                '</div>' +
                '<div>' + textValue + '</div>';

            elementSelected.appendChild(elementToAdd);
        }
    }

    createPanel() {

        this.panel = document.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        var content = "";

        content = "<div class='p-relative'><button id='close-panel' class='btn shadow bg-purple white p-absolute'><i class='fa fa-close'></i></button></div>" +
            "<h2>Editeur</h2>" +
            "<h3 id='selected-element'></h3>" +
            "<form id='edit-element-form' class='d-none flex-direction-column'>" +
            "<label for='type'>Type</label>" +
            "<select id='type' class='mb-1'>" +
            "<option selected>Type</option>";

        this.tags.forEach(tag => {

            content += "<option value='" + tag + "'>" + tag + "</option>";
        });

        content += "</select>" +
            "<label for='id'>Identifiant</label>" +
            "<input type='text' id='id' name='id' placeholder='id' class='mb-1'>" +
            "<label for='size'>Taille</label>" +
            "<select id='size' class='mb-1'>" +
            "<option selected>Tailles</option>";

        for (var i = 1; i <= 12; i++) {

            content += "<option value='col-lg-" + i + "'>col-lg-" + i + "</option>";
        }

        content += "</select>" +
            "<label for='margin'>Marges extérieures</label>" +
            "<input type='text' id='margin' class='mb-1' placeholder='marges extérieures'>" +
            "<label for='padding'>Marges intérieures</label>" +
            "<input type='text' id='padding' class='mb-1' placeholder='marges intérieures'>" +
            "<label for='bg-color'>Couleur de fond</label>" +
            "<select id='bg-color' class='mb-1'>" +
            "<option selected>Couleurs de fond</option>" +
            "<option value='bg-purple'>bg-purple</option>" +
            "<option value='bg-white'>bg-white</option>" +
            "<option value='bg-black'>bg-black</option>" +
            "</select>" +
            "<label for='color'>Couleur de texte</label>" +
            "<select id='color' class='mb-1'>" +
            "<option selected>Couleurs</option>" +
            "<option value='purple'>purple</option>" +
            "<option value='white'>white</option>" +
            "<option value='black'>black</option>" +
            "</select>" +
            "<label for='text'>Classes CSS</label>" +
            "<input type='text' id='classes' name='classes' placeholder='Classes CSS' class='mb-1'>" +
            "<label for='text'>Texte</label>" +
            "<input type='text' id='text' name='text' placeholder='texte' class='mb-1'>" +
            "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-purple shadow white'>" +
            "</div>" +
            "</form>" +
            "<form id='add-element-form' class='d-none flex-direction-column'>" +
            "<label for='type'>Type</label>" +
            "<select id='type' class='mb-1'>" +
            "<option selected>Type</option>";

        this.tags.forEach(tag => {

            content += "<option value='" + tag + "'>" + tag + "</option>";
        });

        content += "</select>" +
            "<label for='id'>Identifiant</label>" +
            "<input type='text' id='id' name='id' placeholder='id' class='mb-1'>" +
            "<label for='size'>Taille</label>" +
            "<select id='size' class='mb-1'>" +
            "<option selected>Tailles</option>";

        for (var i = 1; i <= 12; i++) {

            content += "<option value='col-lg-" + i + "'>col-lg-" + i + "</option>";
        }

        content += "</select>" +
            "<label for='margin'>Marges extérieures</label>" +
            "<input type='text' id='margin' class='mb-1' placeholder='marges extérieures'>" +
            "<label for='padding'>Marges intérieures</label>" +
            "<input type='text' id='padding' class='mb-1' placeholder='marges intérieures'>" +
            "<label for='bg-color'>Couleur de fond</label>" +
            "<select id='bg-color' class='mb-1'>" +
            "<option selected>Couleurs de fond</option>" +
            "<option value='bg-purple'>bg-purple</option>" +
            "<option value='bg-white'>bg-white</option>" +
            "<option value='bg-black'>bg-black</option>" +
            "</select>" +
            "<label for='color'>Couleur de texte</label>" +
            "<select id='color' class='mb-1'>" +
            "<option selected>Couleurs</option>" +
            "<option value='purple'>purple</option>" +
            "<option value='white'>white</option>" +
            "<option value='black'>black</option>" +
            "</select>" +
            "<label for='text'>Classes CSS</label>" +
            "<input type='text' id='classes' name='classes' placeholder='Classes CSS' class='mb-1'>" +
            "<label for='text'>Texte</label>" +
            "<input type='text' id='text' name='text' placeholder='texte' class='mb-1'>" +
            "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-purple shadow white'>" +
            "</div>" +
            "</form>";

        this.panel.innerHTML = content;

        document.body.prepend(this.panel);
    }

    /**
     * Création du bouton d'ouveture/fermeture du panneau
     */
    createPanelButton() {
        // Création du bouton "#html5-checker-button"
        this.editorPanelButton = document.createElement('button');
        this.editorPanelButton.setAttribute('id', 'editor-panel-button');
        this.editorPanelButton.setAttribute('class', 'p-fixed m-1 p-1 d-flex align-items-center justify-content-center');
        this.editorPanelButton.setAttribute('title', 'Editor');

        this.editorPanelButton.innerHTML = "&nbsp;<img src='https://lawrenceterpin.github.io/seo-checker/images/seo.png' alt='Seo Checker'>&nbsp;";

        document.body.prepend(this.editorPanelButton);
    }

    /**
     * Affichage du panneau
     */
    panelDisplay(open) {

        this.options.panel.open = open;

        if (this.options.panel.open == true) {
            // On affiche le panneau de la liste des balises
            this.panel.classList.add("open");
        }
        else {
            // On cache le panneau de la liste des balises
            this.panel.classList.remove("open");
        }
    }

    changeEditorMode() {

        this.options.editorMode = (this.options.editorMode) ? false : true;

        var editor = document.getElementById('editor');

        editor.className = (this.options.editorMode == true) ? "" : "editor-mode";
    }

    /**
     * Génération de la page
     * 
     * @param {*} pageContainerId 
     */
    generatePage(pageContainerId, array) {
        // Container de la page
        var page = document.getElementById(pageContainerId);

        page.innerHTML = "";

        // On ajoute les éléments
        this.createElementsFromArray(page, array);
    }

    /**
     * Création d'éléments à partir d'un tableau
     * 
     * @param {*} parent 
     * @param {*} array 
     */
    createElementsFromArray(parent, array) {
        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            // On créé la balise de l'élément
            var tag = document.createElement(element.tag);
            // On ajoute l'identifiant de l'élément
            array[index].id = parent.id + "-" + element.name + "-" + (index + 1);

            tag.id = element.id;
            // On ajoute la classe de l'élément
            tag.className = element.classes;

            var editElementButton = '<div class="p-relative w-100"><div class="edit-element p-absolute">' +
                '<button class="btn bg-white purple" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div></div>';

            tag.innerHTML = editElementButton;

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


    addElement(parentId, data) {

        this.pageElements.forEach(element => {

            if (element.id = parentId) {

                element.elements.push(data);

                this.generatePage('page', this.pageElements);
            }
        });
    }

    editElement(elementIdSelected) {

        // On ajoute les éléments
        this.getElementsFromArray(elementIdSelected, this.pageElements);
    }

    updateElementData(elementIdSelected, data, array) {

        array.forEach((element, index) => {

            if (element.id == elementIdSelected) {

                array[index].tag = data.tag;
                array[index].id = data.id;
                array[index].classes = data.classes;
                array[index].text = data.text;

                this.generatePage('page', this.pageElements);
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {

                this.updateElementData(elementIdSelected, data, element.elements);
            }
        });
    }

    getElementsFromArray(elementIdSelected, array) {

        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            if (elementIdSelected == element.id) {

                this.updateEditorFormData('edit', elementIdSelected);
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.getElementsFromArray(elementIdSelected, element.elements);
            }
        });
    }
}