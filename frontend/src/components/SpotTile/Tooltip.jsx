const Tooltip = ({ children, tooltipText }) => {
    return (
        <div className="tooltip-container">
            {children}
            <div className="tooltip">{tooltipText}</div>
        </div>
    );
};

export default Tooltip;
