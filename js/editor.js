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
        this.panelIsOpen = this.options.panel.open;

        this.init();
    }

    init() {

        this.createPanel();

        // Création du bouton d'ouverture du panneau
        this.createPanelButton();

        var elements = document.querySelectorAll("#editor .edit-element > button");

        // var idElementSelected;

        elements.forEach(elementSelected => {

            // element.addEventListener('click', function () {

            //     var typeElement = document.getElementById("id-element");
            //     typeElement.innerText = element.parentNode.parentNode.id;

            //     var idValue = document.getElementById('id');
            //     var classValue = document.getElementById('class');

            //     idValue.value = element.parentNode.parentNode.id;
            //     classValue.value = element.parentNode.parentNode.className;

            //     idElementSelected = element.parentNode.parentNode.id;
            // });

            elementSelected.addEventListener('click', () => this.updateDataEditorForm(elementSelected), false);
        });

        var editElementForm = document.getElementById("edit-element-form");

        editElementForm.addEventListener('submit', () => this.saveEditorForm(event), false);

        this.panelDisplay();

        // Clic du bouton d'ouverture/fermeture du panneau
        this.editorPanelButton.addEventListener('click', () => this.panelDisplay(), false);
    }

    updateDataEditorForm(elementSelected) {

        var parentElement = elementSelected.parentNode.parentNode;

        var typeElement = document.getElementById("selected-element");
        typeElement.innerText = parentElement.tagName + "#" + parentElement.id + "." + parentElement.className;

        var idValue = document.getElementById('id');
        var classValue = document.getElementById('class');

        idValue.value = parentElement.id;
        // classValue.sizeValue = parentElement.className;

        this.idElementSelected = parentElement.id;

        this.panelDisplay();
    }

    saveEditorForm(event) {

        event.preventDefault();

        var idValue = document.getElementById('id').value;
        var sizeValue = document.getElementById('size').value;
        var marginValue = document.getElementById('margin').value;
        var paddingValue = document.getElementById('padding').value;

        var bgColorValue = document.getElementById('bg-color').value;
        var colorValue = document.getElementById('color').value;

        var elementSelected = document.getElementById(this.idElementSelected);

        elementSelected.className = sizeValue;

        var content = document.querySelector("#" + elementSelected.id + " > article");

        content.className = marginValue + " " + paddingValue + " " + bgColorValue + " " + colorValue;
    }

    createPanel() {

        this.panel = document.createElement('div');
        this.panel.setAttribute('id', 'editor-panel');
        this.panel.setAttribute('class', 'p-fixed shadow p-1');

        this.panel.innerHTML = "<h2>Editeur</h2>" +
            "<h3 id='selected-element'></h3>" +
            "<form id='edit-element-form' class='d-flex flex-direction-column'>" +
            "<label for='id'>Identifiant</label>" +
            "<input type='text' id='id' name='id' placeholder='id' class='mb-1'>" +
            "<label for='size'>Taille</label>" +
            "<select id='size' class='mb-1'>" +
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
            "<input type='text' id='margin' class='mb-1'>" +
            "<label for='padding'>Marges intérieures</label>" +
            "<input type='text' id='padding' class='mb-1'>" +
            "<label for='bg-color'>Couleur de fond</label>" +
            "<select id='bg-color' class='mb-1'>" +
            "<option value='bg-purple'>bg-purple</option>" +
            "<option value='bg-white'>bg-white</option>" +
            "<option value='bg-black'>bg-black</option>" +
            "</select>" +
            "<label for='color'>Couleur de texte</label>" +
            "<select id='color' class='mb-1'>" +
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
    panelDisplay() {

        this.panelIsOpen = (this.panelIsOpen) ? false : true;

        if (this.panelIsOpen == false) {
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

}