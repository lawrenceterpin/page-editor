class Editor {

    constructor(options) {

        if (typeof options !== 'undefined') {
            this.options = options;
        }
        else {
            this.options = {
                editorMode: true,
                panel: {
                    open: false,
                }
            };
        }

        this.editorMode = this.options.editorMode;
        this.panelIsOpen = this.options.panel.open;

        this.init();
    }

    init() {

        this.changeEditorMode();

        this.createPanel();

        // Création du bouton d'ouverture du panneau
        this.createPanelButton();

        this.editElementsButtons = document.querySelectorAll(".edit-element > button");

        this.editElementsButtons.forEach(editElementButton => {

            editElementButton.addEventListener('click', () => this.updateDataEditorForm('edit', editElementButton), false);
        });

        var addElementButtons = document.querySelectorAll(".add-element > button");

        addElementButtons.forEach(addElementButton => {

            addElementButton.addEventListener('click', () => this.updateDataEditorForm('add', addElementButton), false);
        });

        var editElementForm = document.getElementById("edit-element-form");

        editElementForm.addEventListener('submit', () => this.saveEditorForm('edit', event), false);

        var addElementForm = document.getElementById("add-element-form");

        addElementForm.addEventListener('submit', () => this.saveEditorForm('add', event), false);

        this.panelDisplay(this.panelIsOpen);

        this.editorModeButton = document.getElementById('editor-mode-button');

        this.editorModeButton.addEventListener('click', () => this.changeEditorMode(), false);

        // Clic du bouton d'ouverture/fermeture du panneau
        this.editorPanelButton.addEventListener('click', () => this.panelDisplay(true), false);
    }

    updateDataEditorForm(type, elementSelected) {

        var parentElement = elementSelected.parentNode.parentNode;

        console.log(type, elementSelected, parentElement);

        var typeElement = document.getElementById("selected-element");
        typeElement.innerText = parentElement.tagName + "#" + parentElement.id + "." + parentElement.className;

        var idValue = document.getElementById('id');
        var classValue = document.getElementById('class');

        idValue.value = parentElement.id;

        this.idElementSelected = parentElement.id;

        var editElementForm = document.getElementById('edit-element-form');
        var addElementForm = document.getElementById('add-element-form');

        if (type == 'edit') {
            addElementForm.className = 'd-none flex-direction-column';
            editElementForm.className = 'd-flex flex-direction-column';
        }
        else if (type == 'add') {
            editElementForm.className = 'd-none flex-direction-column';
            addElementForm.className = 'd-flex flex-direction-column';
        }

        this.panelDisplay(true);
    }

    saveEditorForm(type, event) {

        event.preventDefault();

        var form;

        if (type == 'edit') {
            form = document.getElementById('edit-element-form');
        }
        else if (type == 'add') {
            form = document.getElementById('add-element-form');
        }

        var idValue = document.querySelector('#' + form.getAttribute('id') + ' #id').value;
        var sizeValue = document.querySelector('#' + form.getAttribute('id') + ' #size').value;
        var marginValue = document.querySelector('#' + form.getAttribute('id') + ' #margin').value;
        var paddingValue = document.querySelector('#' + form.getAttribute('id') + ' #padding').value;

        var bgColorValue = document.querySelector('#' + form.getAttribute('id') + ' #bg-color').value;
        var colorValue = document.querySelector('#' + form.getAttribute('id') + ' #color').value;

        var elementSelected = document.getElementById(this.idElementSelected);

        if (type == 'edit') {

            elementSelected.className = sizeValue;

            var content = document.querySelector("#" + elementSelected.id + " > .element");

            content.className = "element p-relative " + marginValue + " " + paddingValue + " " + bgColorValue + " " + colorValue;
        }
        else if (type == 'add') {

            var typeValue = document.querySelector('#' + form.getAttribute('id') + ' #type').value;

            var elementToAdd = document.createElement('div');
            elementToAdd.id = idValue;
            elementToAdd.className = "p-relative " + marginValue + " " + paddingValue + " " + bgColorValue + " " + colorValue;
            elementToAdd.innerHTML = '<div class="edit-element p-relative">' +
                '<button class="bg-white btn shadow">&nbsp;<i class="fa fa-edit"></i>&nbsp;</button>' +
                '</div>' +
                '<div class="element"><' + typeValue + '>Hello ;)</ ' + typeValue + '></div>';

            elementSelected.appendChild(elementToAdd);

            this.editElementsButtons = document.querySelectorAll(".edit-element > button");

            this.editElementsButtons.forEach(editElementButton => {

                editElementButton.addEventListener('click', () => this.updateDataEditorForm('edit', editElementButton), false);
            });
        }
    }

    createPanel() {

        this.panel = document.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        this.panel.innerHTML = "<h2>Editeur</h2>" +
            "<h3 id='selected-element'></h3>" +
            "<form id='edit-element-form' class='d-none flex-direction-column'>" +
            "<label for='id'>Identifiant</label>" +
            "<input type='text' id='id' name='id' placeholder='id' class='mb-1'>" +
            "<label for='size'>Taille</label>" +
            "<select id='size' class='mb-1'>" +
            "<option selected>Tailles</option>" +
            "<option value='col-lg-1'>col-lg-1</option>" +
            "<option value='col-lg-2'>col-lg-2</option>" +
            "<option value='col-lg-3'>col-lg-3</option>" +
            "<option value='col-lg-4'>col-lg-4</option>" +
            "<option value='col-lg-5'>col-lg-5</option>" +
            "<option value='col-lg-6'>col-lg-6</option>" +
            "<option value='col-lg-7'>col-lg-7</option>" +
            "<option value='col-lg-8'>col-lg-8</option>" +
            "<option value='col-lg-9'>col-lg-9</option>" +
            "<option value='col-lg-10'>col-lg-10</option>" +
            "<option value='col-lg-11'>col-lg-11</option>" +
            "<option value='col-lg-12'>col-lg-12</option>" +
            "</select>" +
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
            // "<input type='text' id='class' name='class' placeholder='class' class='mb-1'>" +
            "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-purple shadow white'>" +
            "</div>" +
            "</form>" +
            "<form id='add-element-form' class='d-none flex-direction-column'>" +
            "<select id='type' class='mb-1'>" +
            "<option selected>Type</option>" +
            "<option value='div'>div</option>" +
            "<option value='h2'>h2</option>" +
            "<option value='h3'>h3</option>" +
            "<option value='p'>p</option>" +
            "</select>" +
            "<label for='id'>Identifiant</label>" +
            "<input type='text' id='id' name='id' placeholder='id' class='mb-1'>" +
            "<label for='size'>Taille</label>" +
            "<select id='size' class='mb-1'>" +
            "<option selected>Tailles</option>" +
            "<option value='col-lg-1'>col-lg-1</option>" +
            "<option value='col-lg-2'>col-lg-2</option>" +
            "<option value='col-lg-3'>col-lg-3</option>" +
            "<option value='col-lg-4'>col-lg-4</option>" +
            "<option value='col-lg-5'>col-lg-5</option>" +
            "<option value='col-lg-6'>col-lg-6</option>" +
            "<option value='col-lg-7'>col-lg-7</option>" +
            "<option value='col-lg-8'>col-lg-8</option>" +
            "<option value='col-lg-9'>col-lg-9</option>" +
            "<option value='col-lg-10'>col-lg-10</option>" +
            "<option value='col-lg-11'>col-lg-11</option>" +
            "<option value='col-lg-12'>col-lg-12</option>" +
            "</select>" +
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
            // "<input type='text' id='class' name='class' placeholder='class' class='mb-1'>" +
            "<div class='text-center'>" +
            "<input type='submit' value='enregistrer' class='btn bg-purple shadow white'>" +
            "</div>" +
            "</form>";

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

        console.log("TEST");

        this.panelIsOpen = open;

        if (this.panelIsOpen == true) {
            // On affiche le panneau de la liste des balises
            this.panel.classList.add("open");

            this.showPanel();
        }
        else {
            // On cache le panneau de la liste des balises
            this.panel.classList.remove("open");

            this.hidePanel();
        }
    }

    showPanel() {

        this.editorPanelButton.innerHTML = "&nbsp;<i class='fa fa-close'></i>&nbsp;";
    }

    hidePanel() {

        this.editorPanelButton.innerHTML = "&nbsp;<i class='fa fa-edit'></i>&nbsp;";
    }

    changeEditorMode() {

        // console.log(this.editorMode);

        this.editorMode = (this.editorMode) ? false : true;

        var editor = document.getElementById('editor');

        editor.className = (this.editorMode == true) ? "" : "editor-mode";
    }
}