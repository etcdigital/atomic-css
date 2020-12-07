export declare type HTMLTags = ":root" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "big" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "center" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dialog" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "label" | "legend" | "li" | "link" | "main" | "map" | "mark" | "meter" | "nav" | "object" | "ol" | "optgroup" | "option" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rt" | "section" | "select" | "small" | "source" | "span" | "strike" | "strong" | "style" | "sub" | "summary" | "sup" | "svg" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "tr" | "track" | "tt" | "u" | "ul" | "video" | "wbr";
export declare type GlobalRules = {
    [key in HTMLTags]: Record<string, any>;
};