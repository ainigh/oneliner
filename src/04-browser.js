/* browser: the only layer that names a global. Every function is one platform call. */
Weave.library.browser = {};
Weave.library.browser.document = () => document;
Weave.library.browser.window = () => globalThis;
Weave.library.browser.body = () => document.body;
Weave.library.browser.head = () => document.head;
Weave.library.browser.documentElement = () => document.documentElement;
Weave.library.browser.activeElement = () => document.activeElement;
Weave.library.browser.createElement = tag => document.createElement(tag);
Weave.library.browser.createElementNamespaced = (namespace, tag) => document.createElementNS(namespace, tag);
Weave.library.browser.createText = text => document.createTextNode(text);
Weave.library.browser.createFragment = () => document.createDocumentFragment();
Weave.library.browser.createRange = () => document.createRange();
Weave.library.browser.createTemplate = html => Object.assign(document.createElement('template'), { innerHTML: html });
Weave.library.browser.parseHtml = html => Weave.library.browser.createTemplate(html).content;
Weave.library.browser.parseDocument = (text, mime) => new DOMParser().parseFromString(text, mime);
Weave.library.browser.importNode = (node, deep) => document.importNode(node, deep);
Weave.library.browser.adoptNode = node => document.adoptNode(node);

/* constructors: the only place a platform class is named. Feeds every instanceof predicate. */
Weave.library.browser.constructors = {};
Weave.library.browser.constructors.element = () => Element;
Weave.library.browser.constructors.node = () => Node;
Weave.library.browser.constructors.text = () => Text;
Weave.library.browser.constructors.fragment = () => DocumentFragment;
Weave.library.browser.constructors.nodeList = () => NodeList;
Weave.library.browser.constructors.htmlCollection = () => HTMLCollection;
Weave.library.browser.constructors.event = () => Event;
Weave.library.browser.constructors.formData = () => FormData;
Weave.library.browser.constructors.blob = () => Blob;
Weave.library.browser.constructors.file = () => File;
Weave.library.browser.constructors.response = () => Response;
Weave.library.browser.constructors.searchParams = () => URLSearchParams;
Weave.library.browser.isInstance = name => value => value instanceof Weave.library.browser.constructors[name]();
Weave.library.browser.isDocument = value => value === document;
Weave.library.browser.isWindow = value => value === globalThis;

/* keywords, properties, selectors, names: platform literals, each written exactly once. */
Weave.library.browser.keywords = {};
Weave.library.browser.keywords.hidden = 'hidden';
Weave.library.browser.keywords.visible = 'visible';
Weave.library.browser.keywords.none = 'none';
Weave.library.browser.keywords.block = 'block';
Weave.library.browser.keywords.auto = 'auto';
Weave.library.browser.keywords.empty = '';
Weave.library.browser.keywords.space = ' ';
Weave.library.browser.keywords.all = '*';
Weave.library.browser.keywords.true = 'true';
Weave.library.browser.keywords.false = 'false';
Weave.library.browser.keywords.smooth = 'smooth';
Weave.library.browser.keywords.loading = 'loading';
Weave.library.browser.keywords.ariaPrefix = 'aria-';
Weave.library.browser.keywords.dataPrefix = 'data-';
Weave.library.browser.keywords.role = 'role';
Weave.library.browser.keywords.tabindex = 'tabindex';
Weave.library.browser.keywords.name = 'name';
Weave.library.browser.keywords.id = 'id';
Weave.library.browser.keywords.href = 'href';
Weave.library.browser.keywords.target = 'target';
Weave.library.browser.keywords.download = 'download';
Weave.library.browser.keywords.rel = 'rel';
Weave.library.browser.keywords.source = 'src';
Weave.library.browser.keywords.stylesheet = 'stylesheet';
Weave.library.browser.keywords.alt = 'alt';
Weave.library.browser.keywords.type = 'type';
Weave.library.browser.keywords.value = 'value';
Weave.library.browser.keywords.lang = 'lang';
Weave.library.browser.keywords.title = 'title';
Weave.library.browser.keywords.contentType = 'content-type';
Weave.library.browser.keywords.dot = '.';
Weave.library.browser.keywords.hash = '#';
Weave.library.browser.keywords.slash = '/';
Weave.library.browser.keywords.plus = '+';
Weave.library.browser.keywords.draggable = 'draggable';
Weave.library.browser.keywords.move = 'move';

Weave.library.browser.properties = {};
Weave.library.browser.properties.display = 'display';
Weave.library.browser.properties.visibility = 'visibility';
Weave.library.browser.properties.opacity = 'opacity';
Weave.library.browser.properties.height = 'height';
Weave.library.browser.properties.width = 'width';
Weave.library.browser.properties.overflow = 'overflow';
Weave.library.browser.properties.transition = 'transition';
Weave.library.browser.properties.transform = 'transform';
Weave.library.browser.properties.touchAction = 'touchAction';
Weave.library.browser.properties.position = 'position';

Weave.library.browser.selectors = {};
Weave.library.browser.selectors.focusable = 'a[href], button, input, select, textarea, [tabindex], [contenteditable], summary, iframe, audio[controls], video[controls]';
Weave.library.browser.selectors.enabled = ':not([disabled]):not([tabindex="-1"])';
Weave.library.browser.selectors.submittable = 'input:not([type=submit]):not([type=button]):not([type=reset]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
Weave.library.browser.selectors.formControl = 'input, select, textarea, button';
Weave.library.browser.selectors.anchor = 'a[href]';
Weave.library.browser.selectors.editable = 'input, textarea, select, [contenteditable="true"]';

Weave.library.browser.keyNames = {};
Weave.library.browser.keyNames.enter = 'Enter';
Weave.library.browser.keyNames.escape = 'Escape';
Weave.library.browser.keyNames.space = ' ';
Weave.library.browser.keyNames.tab = 'Tab';
Weave.library.browser.keyNames.arrowUp = 'ArrowUp';
Weave.library.browser.keyNames.arrowDown = 'ArrowDown';
Weave.library.browser.keyNames.arrowLeft = 'ArrowLeft';
Weave.library.browser.keyNames.arrowRight = 'ArrowRight';
Weave.library.browser.keyNames.home = 'Home';
Weave.library.browser.keyNames.end = 'End';
Weave.library.browser.keyNames.pageUp = 'PageUp';
Weave.library.browser.keyNames.pageDown = 'PageDown';
Weave.library.browser.keyNames.backspace = 'Backspace';
Weave.library.browser.keyNames.delete = 'Delete';

Weave.library.browser.namespaces = {};
Weave.library.browser.namespaces.svg = 'http://www.w3.org/2000/svg';
Weave.library.browser.namespaces.mathml = 'http://www.w3.org/1998/Math/MathML';
Weave.library.browser.namespaces.xhtml = 'http://www.w3.org/1999/xhtml';
Weave.library.browser.namespaces.xlink = 'http://www.w3.org/1999/xlink';

Weave.library.browser.positions = {};
Weave.library.browser.positions.beforeBegin = 'beforebegin';
Weave.library.browser.positions.afterBegin = 'afterbegin';
Weave.library.browser.positions.beforeEnd = 'beforeend';
Weave.library.browser.positions.afterEnd = 'afterend';

Weave.library.browser.readyStates = {};
Weave.library.browser.readyStates.loading = 'loading';
Weave.library.browser.readyStates.interactive = 'interactive';
Weave.library.browser.readyStates.complete = 'complete';

Weave.library.browser.nodeTypes = {};
Weave.library.browser.nodeTypes.element = 1;
Weave.library.browser.nodeTypes.text = 3;
Weave.library.browser.nodeTypes.comment = 8;
Weave.library.browser.nodeTypes.document = 9;
Weave.library.browser.nodeTypes.fragment = 11;

Weave.library.browser.documentPositions = {};
Weave.library.browser.documentPositions.preceding = 2;
Weave.library.browser.documentPositions.following = 4;

Weave.library.browser.mediaQueries = {};
Weave.library.browser.mediaQueries.reducedMotion = '(prefers-reduced-motion: reduce)';
Weave.library.browser.mediaQueries.darkScheme = '(prefers-color-scheme: dark)';
Weave.library.browser.mediaQueries.lightScheme = '(prefers-color-scheme: light)';
Weave.library.browser.mediaQueries.hover = '(hover: hover)';
Weave.library.browser.mediaQueries.coarsePointer = '(pointer: coarse)';
Weave.library.browser.mediaQueries.print = 'print';
Weave.library.browser.mediaQueries.steadyMotion = '(prefers-reduced-motion: no-preference)';
Weave.library.browser.maxWidthOpen = '(max-width: ';
Weave.library.browser.upToWidth = width => Weave.library.browser.maxWidthOpen + width + Weave.library.composition.closeParen;
Weave.library.browser.minWidthOpen = '(min-width: ';
Weave.library.browser.fromWidth = width => Weave.library.browser.minWidthOpen + width + Weave.library.composition.closeParen;

Weave.library.browser.mimeTypes = {};
Weave.library.browser.mimeTypes.json = 'application/json';
Weave.library.browser.mimeTypes.form = 'application/x-www-form-urlencoded';
Weave.library.browser.mimeTypes.multipart = 'multipart/form-data';
Weave.library.browser.mimeTypes.text = 'text/plain';
Weave.library.browser.mimeTypes.html = 'text/html';
Weave.library.browser.mimeTypes.identifier = 'application/x-weave-identifier';

Weave.library.browser.httpMethods = {};
Weave.library.browser.httpMethods.get = 'GET';
Weave.library.browser.httpMethods.post = 'POST';
Weave.library.browser.httpMethods.put = 'PUT';
Weave.library.browser.httpMethods.patch = 'PATCH';
Weave.library.browser.httpMethods.delete = 'DELETE';
Weave.library.browser.httpMethods.head = 'HEAD';
Weave.library.browser.httpMethods.options = 'OPTIONS';

/* selection: every read of the document tree starts here. */
Weave.library.browser.querySelector = (root, selector) => root.querySelector(selector);
Weave.library.browser.querySelectorAll = (root, selector) => Array.from(root.querySelectorAll(selector));
Weave.library.browser.getElementById = id => document.getElementById(id);
Weave.library.browser.getElementsByName = name => Array.from(document.getElementsByName(name));
Weave.library.browser.matches = (el, selector) => el.matches(selector);
Weave.library.browser.closest = (el, selector) => el.closest(selector);
Weave.library.browser.elementFromPoint = (x, y) => document.elementFromPoint(x, y);

/* tree: parents, children, siblings and every structural mutation. */
Weave.library.browser.parentOf = el => el.parentElement;
Weave.library.browser.childrenOf = el => Array.from(el.children);
Weave.library.browser.childNodesOf = el => Array.from(el.childNodes);
Weave.library.browser.firstChildOf = el => el.firstElementChild;
Weave.library.browser.lastChildOf = el => el.lastElementChild;
Weave.library.browser.nextSiblingOf = el => el.nextElementSibling;
Weave.library.browser.previousSiblingOf = el => el.previousElementSibling;
Weave.library.browser.appendChild = (el, child) => (el.appendChild(child), el);
Weave.library.browser.prependChild = (el, child) => (el.prepend(child), el);
Weave.library.browser.insertBefore = (reference, node) => (reference.before(node), reference);
Weave.library.browser.insertAfter = (reference, node) => (reference.after(node), reference);
Weave.library.browser.replaceChild = (old, replacement) => (old.replaceWith(replacement), replacement);
Weave.library.browser.removeChild = el => (el.remove(), el);
Weave.library.browser.cloneNode = (el, deep) => el.cloneNode(deep);
Weave.library.browser.contains = (parent, node) => parent.contains(node);
Weave.library.browser.compareDocumentPosition = (a, b) => a.compareDocumentPosition(b);
Weave.library.browser.isConnected = el => el.isConnected;
Weave.library.browser.ownerDocumentOf = el => el.ownerDocument;
Weave.library.browser.nodeTypeOf = node => node.nodeType;

/* content: text and markup in and out. */
Weave.library.browser.textContentOf = el => el.textContent;
Weave.library.browser.setTextContent = (el, text) => (el.textContent = text, el);
Weave.library.browser.innerHtmlOf = el => el.innerHTML;
Weave.library.browser.setInnerHtml = (el, html) => (el.innerHTML = html, el);
Weave.library.browser.outerHtmlOf = el => el.outerHTML;
Weave.library.browser.insertAdjacentHtml = (el, position, html) => (el.insertAdjacentHTML(position, html), el);
Weave.library.browser.insertAdjacentElement = (el, position, node) => (el.insertAdjacentElement(position, node), el);

/* attributes and properties: reducers take a pair so tables drive them. */
Weave.library.browser.getAttribute = (el, name) => el.getAttribute(name);
Weave.library.browser.setAttribute = (el, [name, value]) => (el.setAttribute(name, value), el);
Weave.library.browser.removeAttribute = (el, name) => (el.removeAttribute(name), el);
Weave.library.browser.hasAttribute = (el, name) => el.hasAttribute(name);
Weave.library.browser.attributeNamesOf = el => Array.from(el.attributes).map(attribute => attribute.name);
Weave.library.browser.toggleAttribute = (el, name, force) => (el.toggleAttribute(name, force), el);
Weave.library.browser.getProperty = (el, name) => el[name];
Weave.library.browser.setProperty = (el, [name, value]) => (el[name] = value, el);
Weave.library.browser.deleteProperty = (el, name) => (delete el[name], el);
Weave.library.browser.datasetOf = el => el.dataset;
Weave.library.browser.setDataset = (el, [key, value]) => (el.dataset[key] = value, el);
Weave.library.browser.deleteDataset = (el, key) => (delete el.dataset[key], el);
Weave.library.browser.classListOf = el => el.classList;
Weave.library.browser.addClass = (el, name) => (el.classList.add(name), el);
Weave.library.browser.removeClass = (el, name) => (el.classList.remove(name), el);
Weave.library.browser.toggleClass = (el, name, force) => (el.classList.toggle(name, force), el);
Weave.library.browser.replaceClass = (el, old, replacement) => (el.classList.replace(old, replacement), el);
Weave.library.browser.containsClass = (el, name) => el.classList.contains(name);
Weave.library.browser.classNamesOf = el => Array.from(el.classList);
Weave.library.browser.tagNameOf = el => el.tagName.toLowerCase();
Weave.library.browser.idOf = el => el.id;

/* style and geometry: computed values, boxes, scroll and the viewport. */
Weave.library.browser.styleOf = el => el.style;
Weave.library.browser.setStyle = (el, [property, value]) => (el.style[property] = value, el);
Weave.library.browser.removeStyle = (el, property) => (el.style.removeProperty(property), el);
Weave.library.browser.computedStyleOf = el => getComputedStyle(el);
Weave.library.browser.computedValueOf = (el, property) => getComputedStyle(el).getPropertyValue(property);
Weave.library.browser.setCssVariable = (el, [name, value]) => (el.style.setProperty(name, value), el);
Weave.library.browser.cssVariableOf = (el, name) => getComputedStyle(el).getPropertyValue(name);
Weave.library.browser.boundingRectOf = el => el.getBoundingClientRect();
Weave.library.browser.clientRectsOf = el => Array.from(el.getClientRects());
Weave.library.browser.offsetWidthOf = el => el.offsetWidth;
Weave.library.browser.offsetHeightOf = el => el.offsetHeight;
Weave.library.browser.offsetLeftOf = el => el.offsetLeft;
Weave.library.browser.offsetTopOf = el => el.offsetTop;
Weave.library.browser.offsetParentOf = el => el.offsetParent;
Weave.library.browser.clientWidthOf = el => el.clientWidth;
Weave.library.browser.clientHeightOf = el => el.clientHeight;
Weave.library.browser.clientLeftOf = el => el.clientLeft;
Weave.library.browser.clientTopOf = el => el.clientTop;
Weave.library.browser.scrollWidthOf = el => el.scrollWidth;
Weave.library.browser.scrollHeightOf = el => el.scrollHeight;
Weave.library.browser.scrollLeftOf = el => el.scrollLeft;
Weave.library.browser.scrollTopOf = el => el.scrollTop;
Weave.library.browser.setScrollLeft = (el, value) => (el.scrollLeft = value, el);
Weave.library.browser.setScrollTop = (el, value) => (el.scrollTop = value, el);
Weave.library.browser.scrollTo = (el, options) => (el.scrollTo(options), el);
Weave.library.browser.scrollIntoView = (el, options) => (el.scrollIntoView(options), el);
Weave.library.browser.viewportWidth = () => innerWidth;
Weave.library.browser.viewportHeight = () => innerHeight;
Weave.library.browser.pageScrollX = () => scrollX;
Weave.library.browser.pageScrollY = () => scrollY;
Weave.library.browser.scrollWindowTo = options => (scrollTo(options), undefined);
Weave.library.browser.devicePixelRatio = () => devicePixelRatio;
Weave.library.browser.functionType = 'function';
Weave.library.browser.mediaStub = { matches: false, media: '', addEventListener: Weave.library.composition.noop, removeEventListener: Weave.library.composition.noop, addListener: Weave.library.composition.noop, removeListener: Weave.library.composition.noop };
Weave.library.browser.hasMatchMedia = () => typeof matchMedia === Weave.library.browser.functionType;
Weave.library.browser.matchMedia = query => Weave.library.control.either(Weave.library.browser.hasMatchMedia, () => matchMedia(query), () => Weave.library.browser.mediaStub)(query);

/* events: registration, dispatch and every getter the event object exposes. */
Weave.library.browser.addListener = (el, [type, handler]) => (el.addEventListener(type, handler), el);
Weave.library.browser.addListenerWithOptions = (el, type, handler, options) => (el.addEventListener(type, handler, options), el);
Weave.library.browser.removeListener = (el, type, handler, options) => (el.removeEventListener(type, handler, options), el);
Weave.library.browser.createKeyEvent = (type, key) => new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
Weave.library.browser.dispatchKey = (el, type, key) => (Weave.library.browser.dispatch(el, Weave.library.browser.createKeyEvent(type, key)), el);
Weave.library.browser.dispatch = (el, event) => el.dispatchEvent(event);
Weave.library.browser.createEvent = (type, init) => new CustomEvent(type, init);
Weave.library.browser.createKeyboardEvent = (type, init) => new KeyboardEvent(type, init);
Weave.library.browser.createMouseEvent = (type, init) => new MouseEvent(type, init);
Weave.library.browser.createPointerEvent = (type, init) => new PointerEvent(type, init);
Weave.library.browser.setTransferData = (event, type, value) => (event.dataTransfer.setData(type, value), event);
Weave.library.browser.transferDataOf = (event, type) => event.dataTransfer.getData(type);
Weave.library.browser.setDropEffect = (event, value) => (event.dataTransfer.dropEffect = value, event);
Weave.library.browser.withTransfer = (event, transfer) => Object.assign(event, { dataTransfer: transfer });
Weave.library.browser.preventDefault = event => (event.preventDefault(), event);
Weave.library.browser.stopPropagation = event => (event.stopPropagation(), event);
Weave.library.browser.stopImmediatePropagation = event => (event.stopImmediatePropagation(), event);
Weave.library.browser.targetOf = event => event.target;
Weave.library.browser.currentTargetOf = event => event.currentTarget;
Weave.library.browser.relatedTargetOf = event => event.relatedTarget;
Weave.library.browser.typeOf = event => event.type;
Weave.library.browser.detailOf = event => event.detail;
Weave.library.browser.keyOf = event => event.key;
Weave.library.browser.codeOf = event => event.code;
Weave.library.browser.buttonOf = event => event.button;
Weave.library.browser.pointerTypeOf = event => event.pointerType;
Weave.library.browser.clientXOf = event => event.clientX;
Weave.library.browser.clientYOf = event => event.clientY;
Weave.library.browser.pageXOf = event => event.pageX;
Weave.library.browser.pageYOf = event => event.pageY;
Weave.library.browser.deltaYOf = event => event.deltaY;
Weave.library.browser.timeStampOf = event => event.timeStamp;
Weave.library.browser.isDefaultPrevented = event => event.defaultPrevented;
Weave.library.browser.modifiersOf = event => ({ ctrl: event.ctrlKey, meta: event.metaKey, alt: event.altKey, shift: event.shiftKey });
Weave.library.browser.readyState = () => document.readyState;
Weave.library.browser.createAbortController = () => new AbortController();
Weave.library.browser.abort = controller => (controller.abort(), controller);
Weave.library.browser.signalOf = controller => controller.signal;

/* focus, selection and native activation. */
Weave.library.browser.focus = el => (el.focus(), el);
Weave.library.browser.blur = el => (el.blur(), el);
Weave.library.browser.click = el => (el.click(), el);
Weave.library.browser.select = el => (el.select(), el);
Weave.library.browser.setSelectionRange = (el, start, end) => (el.setSelectionRange(start, end), el);
Weave.library.browser.selectionOf = () => getSelection();

/* forms: the platform's own form model, untouched. */
Weave.library.browser.formDataOf = form => new FormData(form);
Weave.library.browser.createFormData = () => new FormData();
Weave.library.browser.formDataEntries = data => Array.from(data.entries());
Weave.library.browser.appendFormData = (data, [name, value]) => (data.append(name, value), data);
Weave.library.browser.elementsOf = form => Array.from(form.elements);
Weave.library.browser.formOf = control => control.form;
Weave.library.browser.labelsOf = control => Array.from(control.labels);
Weave.library.browser.submit = form => (form.submit(), form);
Weave.library.browser.requestSubmit = form => (form.requestSubmit(), form);
Weave.library.browser.reset = form => (form.reset(), form);
Weave.library.browser.checkValidity = el => el.checkValidity();
Weave.library.browser.reportValidity = el => el.reportValidity();
Weave.library.browser.setCustomValidity = (el, message) => (el.setCustomValidity(message), el);
Weave.library.browser.validityOf = el => el.validity;
Weave.library.browser.validationMessageOf = el => el.validationMessage;
Weave.library.browser.filesOf = input => Array.from(input.files);
Weave.library.browser.selectedOptionsOf = select => Array.from(select.selectedOptions);
Weave.library.browser.optionsOf = select => Array.from(select.options);

/* timing and frames: raw ids never escape this layer. */
Weave.library.browser.setTimeout = (f, ms) => setTimeout(f, ms);
Weave.library.browser.clearTimeout = id => clearTimeout(id);
Weave.library.browser.setInterval = (f, ms) => setInterval(f, ms);
Weave.library.browser.clearInterval = id => clearInterval(id);
Weave.library.browser.requestFrame = f => requestAnimationFrame(f);
Weave.library.browser.cancelFrame = id => cancelAnimationFrame(id);
Weave.library.browser.requestIdle = f => requestIdleCallback(f);
Weave.library.browser.cancelIdle = id => cancelIdleCallback(id);
Weave.library.browser.hasIdleCallback = () => typeof requestIdleCallback === Weave.library.predicates.typeNames.isFunction;
Weave.library.browser.now = () => performance.now();
Weave.library.browser.mark = label => performance.mark(label);
Weave.library.browser.measure = (label, from) => performance.measure(label, from);

/* observers: one constructor each, plus the three verbs they share. */
Weave.library.browser.createMutationObserver = callback => new MutationObserver(callback);
Weave.library.browser.hasIntersectionObserver = () => typeof IntersectionObserver === Weave.library.browser.functionType;
Weave.library.browser.createIntersectionObserver = (callback, options) => Weave.library.control.either(Weave.library.browser.hasIntersectionObserver, () => new IntersectionObserver(callback, options), () => Weave.library.browser.observerStub)(callback);
Weave.library.browser.observerStub = { observe: Weave.library.composition.noop, unobserve: Weave.library.composition.noop, disconnect: Weave.library.composition.noop };
Weave.library.browser.hasResizeObserver = () => typeof ResizeObserver === Weave.library.browser.functionType;
Weave.library.browser.createResizeObserver = callback => Weave.library.control.either(Weave.library.browser.hasResizeObserver, () => new ResizeObserver(callback), () => Weave.library.browser.observerStub)(callback);
Weave.library.browser.observe = (observer, el, options) => (observer.observe(el, options), observer);
Weave.library.browser.unobserve = (observer, el) => (observer.unobserve(el), observer);
Weave.library.browser.disconnect = observer => (observer.disconnect(), observer);

/* animation: the Web Animations API is the effects engine. */
Weave.library.browser.animate = (el, keyframes, options) => el.animate(keyframes, options);
Weave.library.browser.hasAnimate = el => typeof el.animate === Weave.library.predicates.typeNames.isFunction;
Weave.library.browser.animationsOf = el => el.getAnimations();
Weave.library.browser.finished = animation => animation.finished;
Weave.library.browser.cancelAnimation = animation => (animation.cancel(), animation);
Weave.library.browser.capturePointer = (el, event) => (el.setPointerCapture(event.pointerId), el);
Weave.library.browser.finishAnimation = animation => (animation.finish(), animation);
Weave.library.browser.commitAnimation = animation => (animation.commitStyles(), animation);
Weave.library.browser.pauseAnimation = animation => (animation.pause(), animation);
Weave.library.browser.playAnimation = animation => (animation.play(), animation);

/* network: fetch and the response readers. */
Weave.library.browser.fetch = (url, init) => fetch(url, init);
Weave.library.browser.responseJson = response => response.json();
Weave.library.browser.responseText = response => response.text();
Weave.library.browser.responseBlob = response => response.blob();
Weave.library.browser.responseFormData = response => response.formData();
Weave.library.browser.responseArrayBuffer = response => response.arrayBuffer();
Weave.library.browser.statusOf = response => response.status;
Weave.library.browser.okOf = response => response.ok;
Weave.library.browser.headersOf = response => response.headers;
Weave.library.browser.headerOf = (response, name) => response.headers.get(name);
Weave.library.browser.urlOf = response => response.url;
Weave.library.browser.createHeaders = init => new Headers(init);
Weave.library.browser.createBlob = (parts, options) => new Blob(parts, options);
Weave.library.browser.createUrl = (url, base) => new URL(url, base);
Weave.library.browser.createSearchParams = init => new URLSearchParams(init);
Weave.library.browser.beacon = (url, data) => navigator.sendBeacon(url, data);

/* storage, location, history, navigator and clipboard. */
Weave.library.browser.localStorageGet = key => localStorage.getItem(key);
Weave.library.browser.localStorageSet = (key, value) => (localStorage.setItem(key, value), value);
Weave.library.browser.localStorageRemove = key => localStorage.removeItem(key);
Weave.library.browser.localStorageClear = () => localStorage.clear();
Weave.library.browser.localStorageKeys = () => Object.keys(localStorage);
Weave.library.browser.sessionStorageGet = key => sessionStorage.getItem(key);
Weave.library.browser.sessionStorageSet = (key, value) => (sessionStorage.setItem(key, value), value);
Weave.library.browser.sessionStorageRemove = key => sessionStorage.removeItem(key);
Weave.library.browser.sessionStorageClear = () => sessionStorage.clear();
Weave.library.browser.sessionStorageKeys = () => Object.keys(sessionStorage);
Weave.library.browser.cookieString = () => document.cookie;
Weave.library.browser.setCookieString = text => (document.cookie = text, text);
Weave.library.browser.location = () => location;
Weave.library.browser.href = () => location.href;
Weave.library.browser.pathname = () => location.pathname;
Weave.library.browser.search = () => location.search;
Weave.library.browser.hash = () => location.hash;
Weave.library.browser.origin = () => location.origin;
Weave.library.browser.protocol = () => location.protocol;
Weave.library.browser.host = () => location.host;
Weave.library.browser.assign = url => location.assign(url);
Weave.library.browser.replace = url => location.replace(url);
Weave.library.browser.reload = () => location.reload();
Weave.library.browser.setHash = value => (location.hash = value, value);
Weave.library.browser.pushState = (state, url) => history.pushState(state, '', url);
Weave.library.browser.replaceState = (state, url) => history.replaceState(state, '', url);
Weave.library.browser.back = () => history.back();
Weave.library.browser.forward = () => history.forward();
Weave.library.browser.go = steps => history.go(steps);
Weave.library.browser.stateOf = () => history.state;
Weave.library.browser.historyLength = () => history.length;
Weave.library.browser.setScrollRestoration = mode => (history.scrollRestoration = mode, mode);
Weave.library.browser.userAgent = () => navigator.userAgent;
Weave.library.browser.language = () => navigator.language;
Weave.library.browser.languages = () => Array.from(navigator.languages);
Weave.library.browser.onLine = () => navigator.onLine;
Weave.library.browser.platform = () => navigator.platform;
Weave.library.browser.hardwareConcurrency = () => navigator.hardwareConcurrency;
Weave.library.browser.maxTouchPoints = () => navigator.maxTouchPoints;
Weave.library.browser.writeClipboardText = text => navigator.clipboard.writeText(text);
Weave.library.browser.readClipboardText = () => navigator.clipboard.readText();
Weave.library.browser.randomValues = count => crypto.getRandomValues(new Uint8Array(count));
Weave.library.browser.randomUuid = () => crypto.randomUUID();
Weave.library.browser.title = () => document.title;
Weave.library.browser.setTitle = text => (document.title = text, text);
Weave.library.browser.visibilityState = () => document.visibilityState;
Weave.library.browser.isPageVisible = () => document.visibilityState === Weave.library.browser.keywords.visible;
Weave.library.browser.deepClone = value => structuredClone(value);

/* dates: the only place the Date constructor is named. Every calendar value starts here. */
Weave.library.browser.timestamp = () => Date.now();
Weave.library.browser.currentDate = () => new Date();
Weave.library.browser.createDate = value => new Date(value);
Weave.library.browser.dateFromParts = (year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) => new Date(year, month, day, hours, minutes, seconds, milliseconds);
Weave.library.browser.dateTimeValue = date => date.getTime();
Weave.library.browser.isoOf = date => date.toISOString();
Weave.library.browser.isValidDate = date => Number.isFinite(date.getTime());

/* dateParts: one row per readable field of a Date. The generator below turns each row into a reader. */
Weave.library.browser.dateParts = {};
Weave.library.browser.dateParts.year = 'getFullYear';
Weave.library.browser.dateParts.month = 'getMonth';
Weave.library.browser.dateParts.day = 'getDate';
Weave.library.browser.dateParts.hours = 'getHours';
Weave.library.browser.dateParts.minutes = 'getMinutes';
Weave.library.browser.dateParts.seconds = 'getSeconds';
Weave.library.browser.dateParts.milliseconds = 'getMilliseconds';
Weave.library.browser.dateParts.weekday = 'getDay';
Weave.library.browser.datePart = method => date => date[method]();
Weave.library.browser.dateReaders = {};
Weave.library.composition.defineEach(Weave.library.browser.dateReaders, Weave.library.browser.datePart)(Weave.library.browser.dateParts);

/* intl: the only place a locale formatter is constructed. One function per formatter the library needs. */
Weave.library.browser.formatNumber = (value, locale, options) => new Intl.NumberFormat(locale, options).format(value);
Weave.library.browser.formatDate = (date, locale, options) => new Intl.DateTimeFormat(locale, options).format(date);
Weave.library.browser.formatRelative = (value, unit, locale) => new Intl.RelativeTimeFormat(locale).format(value, unit);
Weave.library.browser.formatList = (items, locale) => new Intl.ListFormat(locale).format(items);
Weave.library.browser.canonicalLocale = name => Weave.library.composition.first(Intl.getCanonicalLocales(name));
