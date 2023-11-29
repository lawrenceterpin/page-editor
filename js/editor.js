class Editor {
    // Options de la classe Editor
    options = {
        editorMode: true,
        editorContainerId: "editor",
        jsonDatasUrl: "https://lawrenceterpin.github.io/page-editor/js/datas.json",
        panel: {
            open: false,
        }
    };

    tags = ["header", "main", "footer", "nav", "section", "article", "h1", "h2", "h3", "h4", "ul", "li", "p", "a"];

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

        this.loadData();

        this.editorModeEnable();

        this.createPanel();
    }

    loadData() {

        fetch(this.options.jsonDatasUrl)
            .then(response => {
                return response.json();
            })
            .then(data => {

                this.pageDatas = data;

                this.generatePage();
            });
    }

    /**
     * Mise à jour des données du formulaire d'édition
     * 
     * @param {*} type 
     * @param {*} parentElementId 
     */
    displayEditorForm(type) {

        this.form = (type == 'edit') ? this.editElementForm : this.addElementForm;

        this.elementSelected = document.getElementById(this.elementIdSelected);

        var typeElement = document.getElementById("selected-element");
        typeElement.innerText = "élément: " + this.elementSelected.tagName.toLowerCase() + "#" + this.elementIdSelected;

        if (type == 'edit') {

            document.querySelector('#' + this.form.getAttribute('id') + ' #type').value = this.elementSelected.tagName.toLowerCase();
            document.querySelector('#' + this.form.getAttribute('id') + ' #classes').value = this.elementSelected.classList;
            // document.querySelector('#' + this.editElementForm.getAttribute('id') + ' #text').value = this.parentElement.innerText;

            this.addElementForm.className = 'd-none flex-direction-column';
        }
        else if (type == 'add') {

            document.querySelector('#' + this.form.getAttribute('id') + ' #type').value = "";
            document.querySelector('#' + this.form.getAttribute('id') + ' #classes').value = "";
            document.querySelector('#' + this.form.getAttribute('id') + ' #text').value = "";

            this.editElementForm.className = 'd-none flex-direction-column';
        }

        this.form.className = 'd-flex flex-direction-column';

        this.panelDisplay(true);
    }

    saveEditorForm(type, event) {

        event.preventDefault();

        var typeValue = document.querySelector('#' + this.form.getAttribute('id') + ' #type').value;

        // var idValue = document.querySelector('#' + form.getAttribute('id') + ' #id').value;
        // var sizeValue = document.querySelector('#' + form.getAttribute('id') + ' #size').value;
        // var marginValue = document.querySelector('#' + form.getAttribute('id') + ' #margin').value;
        // var paddingValue = document.querySelector('#' + form.getAttribute('id') + ' #padding').value;
        // var bgColorValue = document.querySelector('#' + form.getAttribute('id') + ' #bg-color').value;
        // var colorValue = document.querySelector('#' + form.getAttribute('id') + ' #color').value;
        var classesValue = document.querySelector('#' + this.form.getAttribute('id') + ' #classes').value;
        var textValue = document.querySelector('#' + this.form.getAttribute('id') + ' #text').value;

        var data = {
            "tag": typeValue,
            "name": typeValue,
            "classes": classesValue,
            "text": textValue
        };

        if (type == 'add') {
            data.elements = [];
        }

        this.getElementsFromArray(this.pageDatas, data, type);
    }

    createPanel() {
        // Création du bouton de changement de mode d'édition
        this.editorModeButton = document.createElement('button');
        this.editorModeButton.setAttribute('id', 'editor-mode-button');
        this.editorModeButton.setAttribute('class', 'p-absolute btn shadow round');
        this.editorModeButton.setAttribute('onclick', 'editor.editorModeEnable()');

        this.editorModeButton.innerHTML = '<i class="fa fa-eye"></i></button>';

        document.body.prepend(this.editorModeButton);

        // Création du panneau
        this.panel = document.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        var content = "<div class='p-relative'>" +
            "<button id='close-panel' class='btn shadow bg-purple white p-absolute' onclick='editor.panelDisplay(false)'><i class='fa fa-close'></i></button>" +
            "</div>" +
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
            //     "<label for='size'>Taille</label>" +
            //     "<select id='size' class='mb-1'>" +
            //     "<option selected>Tailles</option>";

            // for (var i = 1; i <= 12; i++) {

            //     content += "<option value='col-lg-" + i + "'>col-lg-" + i + "</option>";
            // }

            //content += "</select>" +
            // "<label for='margin'>Marges extérieures</label>" +
            // "<input type='text' id='margin' class='mb-1' placeholder='marges extérieures'>" +
            // "<label for='padding'>Marges intérieures</label>" +
            // "<input type='text' id='padding' class='mb-1' placeholder='marges intérieures'>" +
            // "<label for='bg-color'>Couleur de fond</label>" +
            // "<select id='bg-color' class='mb-1'>" +
            // "<option selected>Couleurs de fond</option>" +
            // "<option value='bg-purple'>bg-purple</option>" +
            // "<option value='bg-white'>bg-white</option>" +
            // "<option value='bg-black'>bg-black</option>" +
            // "</select>" +
            // "<label for='color'>Couleur de texte</label>" +
            // "<select id='color' class='mb-1'>" +
            // "<option selected>Couleurs</option>" +
            // "<option value='purple'>purple</option>" +
            // "<option value='white'>white</option>" +
            // "<option value='black'>black</option>" +
            // "</select>" +
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
            //     "<label for='size'>Taille</label>" +
            //     "<select id='size' class='mb-1'>" +
            //     "<option selected>Tailles</option>";

            // for (var i = 1; i <= 12; i++) {

            //     content += "<option value='col-lg-" + i + "'>col-lg-" + i + "</option>";
            // }

            // content += "</select>" +
            // "<label for='margin'>Marges extérieures</label>" +
            // "<input type='text' id='margin' class='mb-1' placeholder='marges extérieures'>" +
            // "<label for='padding'>Marges intérieures</label>" +
            // "<input type='text' id='padding' class='mb-1' placeholder='marges intérieures'>" +
            // "<label for='bg-color'>Couleur de fond</label>" +
            // "<select id='bg-color' class='mb-1'>" +
            // "<option selected>Couleurs de fond</option>" +
            // "<option value='bg-purple'>bg-purple</option>" +
            // "<option value='bg-white'>bg-white</option>" +
            // "<option value='bg-black'>bg-black</option>" +
            // "</select>" +
            // "<label for='color'>Couleur de texte</label>" +
            // "<select id='color' class='mb-1'>" +
            // "<option selected>Couleurs</option>" +
            // "<option value='purple'>purple</option>" +
            // "<option value='white'>white</option>" +
            // "<option value='black'>black</option>" +
            // "</select>" +
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

        // On récupère le formulaire d'édition d'élément
        this.editElementForm = document.getElementById("edit-element-form");

        // On récupère le formulaire d'ajout d'élément
        this.addElementForm = document.getElementById("add-element-form");

        this.editElementForm.addEventListener('submit', () => this.saveEditorForm('edit', event), false);
        this.addElementForm.addEventListener('submit', () => this.saveEditorForm('add', event), false);

        // Ouverture/fermeture du panneau d'édition 
        this.panelDisplay(this.options.panel.open);
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

    /**
     * Changement du mode d'édition
     */
    editorModeEnable() {

        this.options.editorMode = (this.options.editorMode) ? false : true;

        var editor = document.getElementById('editor');

        editor.className = (this.options.editorMode == true) ? "" : "editor-mode";
    }

    /**
     * Génération de la page
     */
    generatePage() {

        var page = document.getElementById(this.options.editorContainerId)
        page.innerHTML = "";

        // On ajoute les éléments
        this.createElementsFromArray(page, this.pageDatas);
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
            // On créé l'identifiant de l'élément
            element.id = parent.id + "-" + element.name + "-" + (index + 1);
            // On ajoute l'identifiant de l'élément
            tag.id = element.id;
            // On ajoute la classe de l'élément
            tag.className = element.classes;

            // On ajoute le bouton d'édition
            tag.innerHTML = '<div class="edit-element p-relative w-100">' +
                '<div class="p-absolute d-flex gap-1 bg-white p-1 align-items-center">' +
                '<h4><b>' + element.tag + '#' + tag.id + '</b></h4>&nbsp;' +
                '<button class="btn bg-white purple shadow" title="#' + tag.id + '" onclick="editor.addElement(\'' + tag.id.trim() + '\')"><i class="fa fa-plus-circle"></i></button>' +
                '<button class="btn bg-white purple shadow" title="#' + tag.id + '" onclick="editor.editElement(\'' + tag.id.trim() + '\')"><i class="fa fa-edit"></i></button>' +
                '</div></div>';

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

        this.elementIdSelected = elementIdSelected;

        this.getElementsFromArray(this.pageDatas, null, 'add');
    }

    editElement(elementIdSelected) {

        this.elementIdSelected = elementIdSelected;

        this.getElementsFromArray(this.pageDatas, null, 'edit');
    }

    getElementsFromArray(array, data, type) {
        // Pour chaque élément du tableau
        array.forEach((element, index) => {

            if (this.elementIdSelected == element.id) {

                if (data !== null) {
                    if (type == 'add') {

                        element.elements.push(data);
                    }
                    else if (type == 'edit') {

                        element.tag = data.tag;
                        element.id = data.id;
                        element.classes = data.classes;
                        element.text = data.text;
                    }

                    // On regénère la page
                    this.generatePage();
                }
                else {

                    this.displayEditorForm(type);
                }
            }

            // Si l'élément contient un tableau d'éléments
            if (typeof element.elements !== 'undefined') {
                // On parcours les éléments du tableau
                this.getElementsFromArray(element.elements, data, type);
            }
        });
    }
}