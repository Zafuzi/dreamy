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

            element.helpers[helper.name] = helper.method;
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
                // call the helper assuming async
                const result = await helper(element, element.dataset);
                const elementHTML = element.outerHTML;
                // replace the name of the helper called with the result
                element.outerHTML = elementHTML.replace(`__${name}__`, result);
            }
        });
    },
    async convertAllBlocks() {
        const blocks = Tooling.getAll("block");

        blocks.forEach(async (block) => {
            const componentName = block.id;
            try {
                const component = await fetch(`/components/${componentName}.html`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "text/html"
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