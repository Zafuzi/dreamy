const Tooling = {
    getAll(selector) {
        return document.querySelectorAll(selector);
    },
    addHelper(selector, helper) {
        Tooling.getAll(selector).forEach((element) => {
            if(!element.helpers) 
            {
                element.helpers = {};
            }

            element.helpers[helper.name] = helper;
        });
    },
    async runHelpers(selector) {
        let elements = Tooling.getAll(selector);

        elements.forEach(async (element) => {
            // get all helpers from the element
            const helpers = element.helpers;

            if(!helpers) return;

            // loop through all helpers
            for (const [name, helper] of Object.entries(helpers)) {

                // store the OG element HTML for later
                helper.originalHTML = element.outerHTML;
                Tooling.runHelper(element, helper, name);
            }
        });
    },
    async runHelper(element, helper, name)
    {
        if(!helper.method) return;

        // call the helper assuming async
        const result = await helper.method(element, element.dataset);
        const elementHTML = element.outerHTML;
        // replace the name of the helper called with the result
        element.outerHTML = elementHTML.replace(`{{${name}}}`, result);
    },
    async convertAllBlocks() {
        const blocks = Tooling.getAll("block");

        blocks.forEach(async (block) => {
            const componentName = block.id;
            try {
                const component = await fetch(`/components/${componentName}.html`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "text/html",
                        "Accepts": "text/html"
                    }
                }).then((response) => response.text());


                const componentElement = document.createElement("div");
                componentElement.innerHTML = component;
                
                // get the first child of the ORIGINAL component element
                const firstChild = componentElement.firstChild.querySelector(":first-child");
                componentElement.id = componentName;

                const scripts = [];

                // strip out the script tags and convert them to inline scripts and append them to the body
                const componentScripts = componentElement.querySelectorAll("script");
                componentScripts.forEach((script) => {
                    const newScript = document.createElement("script");
                    newScript.innerHTML = script.innerHTML;
                    componentElement.removeChild(script);
                    scripts.push(newScript);
                });

                block.outerHTML = componentElement.innerHTML;

                scripts.forEach((script) => {
                    // console.log("running script", script);
                    document.body.appendChild(script);
                });

                Tooling.runHelpers(`${componentName}`);
            }
            catch (e) {
                console.error(`Component ${componentName} not found.`);
            }
        });
    }
};