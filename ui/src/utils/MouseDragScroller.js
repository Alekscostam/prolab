export class MouseDragScroller {
    constructor(containerElement) {
        this.container = containerElement;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        this.dragStartTimeout = null;
        this.suppressClick = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
    }

    init() {
        if (!this.container) return;
        this.destroy();
        this.container.addEventListener('mousedown', this.onMouseDown);
        this.container.addEventListener('mouseleave', this.onMouseUp);
        this.container.addEventListener('mouseup', this.onMouseUp);
        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('dblclick', this.onDoubleClick);
    }

    destroy() {
        if (!this.container) return;

        this.container.removeEventListener('mousedown', this.onMouseDown);
        this.container.removeEventListener('mouseleave', this.onMouseUp);
        this.container.removeEventListener('mouseup', this.onMouseUp);
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('dblclick', this.onDoubleClick);
    }

    onMouseDown(e) {
        if (e.button !== 0) return;
        this.dragStartTimeout = setTimeout(() => {
            this.isDragging = true;
            this.startX = e.pageX - this.container.offsetLeft;
            this.startY = e.pageY - this.container.offsetTop;
            this.scrollLeft = this.container.scrollLeft;
            this.scrollTop = this.container.scrollTop;
            this.container.style.cursor = 'grabbing';
            this.container.style.userSelect = 'none';
        }, 10);
    }

    onMouseUp(e) {
        clearTimeout(this.dragStartTimeout);
        this.dragStartTimeout = null;

        if (this.isDragging) {
            this.isDragging = false;
            this.container.style.cursor = 'default';
            this.container.style.removeProperty('user-select');
        }
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const x = e.pageX - this.container.offsetLeft;
        const y = e.pageY - this.container.offsetTop;

        const walkX = x - this.startX;
        const walkY = y - this.startY;

        this.container.scrollLeft = this.scrollLeft - walkX;
        this.container.scrollTop = this.scrollTop - walkY;
    }

    onDoubleClick(e) {}
}
