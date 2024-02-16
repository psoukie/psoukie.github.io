/* sidenotes.js: standalone JS library for parsing HTML documents with Pandoc-style footnotes and dynamically repositioning them into the left/right margins, when browser windows are wide enough.
Sidenotes are superior to footnotes where possible because they enable the reader to immediately look at them without requiring user action to 'go to' or 'pop up' the footnotes; even floating footnotes require effort by the reader.
sidenotes.js is inspired by the Tufte-CSS sidenotes (https://edwardtufte.github.io/tufte-css/#sidenotes), but where Tufte-CSS uses static footnotes inlined into the body of the page (requiring modifications to Pandoc's compilation), which doesn't always work well for particularly long or frequent sidenotes, sidenotes.js will rearrange sidenotes to fit as best as possible, and will respond to window changes.
Particularly long sidenotes are also partially 'collapsed'.

Author: Said Achmiz
2019-03-11
license: MIT (derivative of footnotes.js, which is PD)

Simplified for use on pavelsoukenik.com by Pavel Soukenik
*/


if (typeof window.GW == "undefined")
    window.GW = { };
function GWLog (string) {
        // console.log(string);
}

/***********/
/* HELPERS */
/***********/

/*  The "target counterpart" is the element associated with the target, i.e.:
    if the URL hash targets a footnote reference, its counterpart is the
    sidenote for that citation; and vice-versa, if the hash targets a sidenote,
    its counterpart is the in-text citation. We want a target counterpart to be
    highlighted along with the target itself; therefore we apply a special
    "targeted" class to the target counterpart.
    */
function updateTargetCounterpart() {
    GWLog("updateTargetCounterpart");

    /*  Clear existing targeting.
        */
    document.querySelectorAll(".targeted").forEach(element => {
        element.classList.remove("targeted");
    });

    /*  Identify new target counterpart, if any.
        */
    var counterpart;
    if (location.hash.hasPrefix("/#sn:")) {
        counterpart = document.querySelector("#fnref:" + location.hash.substr(4));
    } else if (location.hash.hasPrefix("/#fnref:") && (window.innerWidth >= 992) ) {
        counterpart = document.querySelector("#sn:" + location.hash.substr(7));
    }
    /*  If a target counterpart exists, mark it as such.
        */
    if (counterpart)
        counterpart.classList.toggle("targeted", true);
}

/*  This is necessary to defeat a bug where if the page is loaded with the URL
    hash targeting some element, the element does not match the :target CSS
    pseudo-class.
    */
function realignHashIfNeeded() {
    GWLog("realignHashIfNeeded");

    if (location.hash.hasPrefix("/#sn:") || location.hash.hasPrefix("/#fnref:"))
        realignHash();
}
function realignHash() {
    GWLog("realignHash");

    var hash = location.hash;
    history.replaceState(null, null, "#");
    location.hash = hash;
}

/*  Make sure clicking a sidenote does not cause scrolling.
    */
function setHashWithoutScrolling(newHash) {
    var selectedRange;

    let scrollPositionBeforeNavigate = window.scrollY;
    location.hash = newHash;
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionBeforeNavigate);
    });
}


/*  Returns true if the string begins with the given prefix.
    */
String.prototype.hasPrefix = function (prefix) {
    return (this.lastIndexOf(prefix, 0) === 0);
}

/*  This function expands all necessary collapse blocks to reveal the element
    targeted by the URL hash. (This includes expanding collapse blocks to
    reveal a footnote reference associated with a targeted sidenote). It also
    scrolls the targeted element into view.
    */
function revealTarget() {
    GWLog("revealTarget");

    if (!location.hash) return;
    let target = document.querySelector(decodeURIComponent(location.hash.replace(/:/, "\\:")));
    if (!target) return;

    //  Scroll the target into view.
    target.scrollIntoView();
}


/***************************/
/* FOOTNOTES VS. SIDENOTES */
/***************************/

/*  In footnote mode (i.e., on viewports too narrow to support sidenotes),
    footnote reference links (i.e., citations) should point down to footnotes.
    But in sidenote mode, footnote reference links should point to sidenotes.
    This function rewrites all footnote reference links appropriately to the
    current mode (based on viewport width).
    */
function updateFootnoteReferenceLinks() {
    GWLog("updateFootnoteReferenceLinks");

    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let fnref = GW.sidenotes.footnoteRefs[i];
        const anchorText = fnref.href.slice(fnref.href.indexOf("#") + 4);
        if (window.innerWidth >= 992) {
            fnref.href = "#sn:" + anchorText;
        } else {
            fnref.href = "#fn:" + anchorText;
        }
    }
}

/*  Bind event listeners for the footnote popups or the sidenotes, as
    appropriate for the current viewport width; unbind the others.
    */
function updateFootnoteEventListeners() {
    GWLog("updateFootnoteEventListeners");

    /*  Determine whether we are in sidenote mode or footnote mode.
        */
    var sidenotesMode = (window.innerWidth >= 992);

    if (sidenotesMode) {
        //  Bind sidenote mouse events.
        for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
            let fnref = GW.sidenotes.footnoteRefs[i];
            let sidenote = GW.sidenotes.sidenoteDivs[i];

            fnref.addEventListener("mouseover", GW.sidenotes.footnoteover = () => {
                sidenote.classList.toggle("highlighted", true);
            });
            fnref.addEventListener("mouseout", GW.sidenotes.footnoteout = () => {
                sidenote.classList.remove("highlighted");
            });
            sidenote.addEventListener("mouseover", GW.sidenotes.sidenoteover = () => {
                fnref.classList.toggle("highlighted", true);
            });
            sidenote.addEventListener("mouseout", GW.sidenotes.sidenoteout = () => {
                fnref.classList.remove("highlighted");
            });
        }
    } else {
        //  Unbind sidenote mouse events.
        for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
            let fnref = GW.sidenotes.footnoteRefs[i];
            let sidenote = GW.sidenotes.sidenoteDivs[i];

            fnref.removeEventListener("mouseover", GW.sidenotes.footnoteover);
            fnref.removeEventListener("mouseout", GW.sidenotes.footnoteout);
            sidenote.removeEventListener("mouseover", GW.sidenotes.sidenoteover);
            sidenote.removeEventListener("mouseout", GW.sidenotes.sidenoteout);
        }
    }
}

/**********/
/* LAYOUT */
/**********/

/*  This function actually calculates and sets the positions of all sidenotes.
    */
function updateSidenotePositions() {
    GWLog("updateSidenotePositions");

    /*  If we're in footnotes mode (i.e., the viewport is too narrow), then
        don't do anything.
        */
    if (window.innerWidth < 992)
        return;

    /*  Position left sidenote column so top is flush with top of first
        full-width block (i.e., one that is not pushed right by the TOC).

        NOTE: This doesnâ€™t quite do what it says (due to overflow), but thatâ€™s
        fine; nothing really breaks as a result...
        */
    let markdownBody = document.querySelector("div.content");
    // var firstFullWidthBlock;
    // for (var block of markdownBody.children) {
    //     if (block.clientWidth == markdownBody.clientWidth) {
    //         firstFullWidthBlock = block;
    //         break;
    //     }
    // }
    // let offset = firstFullWidthBlock.offsetTop || 0;
    // if (GW.sidenotes.sidenoteColumnLeft.offsetTop < firstFullWidthBlock.offsetTop) {
    //     GW.sidenotes.sidenoteColumnLeft.style.top = offset + "px";
    //     GW.sidenotes.sidenoteColumnLeft.style.height = `calc(100% - ${offset}px)`;
    // }

    let metaHeight = 0;
    if (window.innerWidth >= 992 && window.innerWidth < 1200) {
        const headerBar = document.querySelector("main > header");
        const aboutBar = document.querySelector("#about-column");
        const headerHeight = headerBar ? headerBar.clientHeight : 0;
        const aboutHeight = aboutBar ? aboutBar.clientHeight : 0;
        metaHeight = headerHeight + aboutHeight + 32;
    }

    GW.sidenotes.sidenoteColumn.style.height = markdownBody.clientHeight - metaHeight + "px";


    /*  Initial layout (to force browser layout engine to compute sidenotesâ€™
        height for us).
        */
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let sidenote = GW.sidenotes.sidenoteDivs[i];


        //  What side is this sidenote on?
        let side = GW.sidenotes.sidenoteColumn;

        //  Default position (vertically aligned with the footnote reference).
        sidenote.style.top = Math.round(((GW.sidenotes.footnoteRefs[i].getBoundingClientRect().top) - side.getBoundingClientRect().top) + 4) + "px";

        /*  Mark sidenotes which are cut off vertically.
            */
        let sidenoteOuterWrapper = sidenote.firstElementChild;
        sidenote.classList.toggle("cut-off", (sidenoteOuterWrapper.scrollHeight > sidenoteOuterWrapper.clientHeight + 2));
    }

    /*  Determine proscribed vertical ranges (i.e., bands of the page from which
        sidenotes are excluded, by the presence of, e.g., a full-width table).
        */
    var proscribedVerticalRanges = [ ];
    let rightColumnBoundingRect = GW.sidenotes.sidenoteColumn.getBoundingClientRect();
    /*  Examine all potentially overlapping elements (i.e., non-sidenote
        elements that may appear in, or extend into, the side columns).
        */
    GW.sidenotes.potentiallyOverlappingElementsSelector = ".marginnote, .tableWrapper.full-width, figure.full-width";
    document.querySelectorAll(GW.sidenotes.potentiallyOverlappingElementsSelector).forEach(potentiallyOverlappingElement => {
        let elementBoundingRect = potentiallyOverlappingElement.getBoundingClientRect();
        proscribedVerticalRanges.push({ top: elementBoundingRect.top - rightColumnBoundingRect.top,
                                        bottom: elementBoundingRect.bottom - rightColumnBoundingRect.top });
    });
    /*  The bottom of the right column is also a "proscribed vertical range".
        */
    proscribedVerticalRanges.push({
        top:    GW.sidenotes.sidenoteColumn.clientHeight,
        bottom: GW.sidenotes.sidenoteColumn.clientHeight
    });

    /*  Correct for overlap (both between sidenotes, and of sidenotes with
        proscribed vertical ranges, such as those associated with full-width
        tables).
        */
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let sidenote = GW.sidenotes.sidenoteDivs[i];
        let nextSidenote = sidenote.nextElementSibling;

        //  What side is this sidenote on?
        let side = GW.sidenotes.sidenoteColumn;

        /*  What points bound the vertical region within which this sidenote may
            be placed?
            */
        let room = {
            ceiling:    0,
            floor:      side.clientHeight
        };
        let sidenoteFootprint = {
            top:    sidenote.offsetTop - GW.sidenotes.sidenoteSpacing,
            bottom: sidenote.offsetTop + sidenote.clientHeight + GW.sidenotes.sidenoteSpacing
        };
        let sidenoteFootprintHalfwayPoint = (sidenoteFootprint.top + sidenoteFootprint.bottom) / 2;
        /*  Simultaneously traverse the array of proscribed ranges up and down,
            narrowing down the room we have to work with (in which to place this
            sidenote) from both sides.
            */
        var nextProscribedRangeAfterSidenote = -1;
        for (var j = 0; j < proscribedVerticalRanges.length; j++) {
            let rangeCountingUp = {
                top:            proscribedVerticalRanges[j].top - side.offsetTop,
                bottom:         proscribedVerticalRanges[j].bottom - side.offsetTop,
            };
            rangeCountingUp.halfwayPoint = (rangeCountingUp.top + rangeCountingUp.bottom) / 2;
            if (rangeCountingUp.halfwayPoint < sidenoteFootprintHalfwayPoint)
                room.ceiling = rangeCountingUp.bottom;

            let indexCountingDown = proscribedVerticalRanges.length - j - 1;
            let rangeCountingDown = {
                top:    proscribedVerticalRanges[indexCountingDown].top - side.offsetTop,
                bottom: proscribedVerticalRanges[indexCountingDown].bottom - side.offsetTop
            };
            rangeCountingDown.halfwayPoint = (rangeCountingDown.top + rangeCountingDown.bottom) / 2;
            if (rangeCountingDown.halfwayPoint > sidenoteFootprintHalfwayPoint) {
                room.floor = rangeCountingDown.top;
                nextProscribedRangeAfterSidenote = indexCountingDown;
            }
        }
        GWLog(`Sidenote ${i + 1}â€™s room is: (${room.ceiling}, ${room.floor}).`);

        //  Is this sidenote capable of fitting within the room it now occupies?
        if (sidenoteFootprint.bottom - sidenoteFootprint.top > room.floor - room.ceiling) {
            /*  If this is not caused by bumping into the top of a proscribed
                range, then it could only be because the sidenote is either too
                long for the entire page itself, or itâ€™s longer than the entire
                footnotes section (and comes very late in the document).
                In that case, just give up.
                */
            if (nextProscribedRangeAfterSidenote == -1) {
                GWLog("TOO MANY SIDENOTES. GIVING UP. :(");
                return;
            }

            /*  Otherwise, move the sidenote down to the next free space, and
                try laying it out again.
                */
            sidenote.style.top = (proscribedVerticalRanges[nextProscribedRangeAfterSidenote].bottom + GW.sidenotes.sidenoteSpacing) + "px";
            i--;
            continue;
        }
        /*  At this point, we are guaranteed that the sidenote can fit within
            its room. We do not have to worry that it will overlap its floor if
            we move it right up against its ceiling (or vice versa).
            */

        /*  Does this sidenote overlap its roomâ€™s ceiling? In such a case, we
            will have to move it down, regardless of whether thereâ€™s a next
            sidenote that would be overlapped.
            */
        var overlapWithCeiling = room.ceiling - sidenoteFootprint.top;
        if (overlapWithCeiling > 0) {
            GWLog(`Sidenote ${sidenote.id.substr(2)} overlaps its ceiling!`);

            sidenote.style.top = (parseInt(sidenote.style.top) + overlapWithCeiling) + "px";
            sidenoteFootprint.top += overlapWithCeiling;
            sidenoteFootprint.bottom += overlapWithCeiling;
        }

        //  Does this sidenote overlap its roomâ€™s floor?
        var overlapWithFloor = sidenoteFootprint.bottom - room.floor;
        if (overlapWithFloor > 0)
            GWLog(`Sidenote ${sidenote.id.substr(2)} overlaps its floor!`);

        /*  Is there a next sidenote, and if so, is there any overlap between
            it and this one?
            */
        var overlapWithNextSidenote = nextSidenote ?
                                      (sidenoteFootprint.bottom - nextSidenote.offsetTop) :
                                      -1;
        if (overlapWithNextSidenote > 0)
            GWLog(`Sidenote ${sidenote.id.substr(2)} overlaps sidenote ${nextSidenote.id.substr(2)}!`);

        /*  If the sidenote overlaps the next sidenote AND its roomâ€™s floor,
            we want to know what it overlaps more.
            */
        var overlapBelow = Math.max(overlapWithNextSidenote, overlapWithFloor);

        /*  If thereâ€™s no overlap with the roomâ€™s floor, and thereâ€™s no overlap
            with the next sidenote (or there is no next sidenote), then the
            current sidenoteâ€™s position needs no further adjustment.
            */
        if (overlapBelow <= 0) continue;

        /*  Figure out how much vertical space above we have; if thereâ€™s enough
            â€œheadroomâ€, we can simply move the current sidenote up.
            */
        let previousSidenote = sidenote.previousElementSibling;
        let maxHeadroom = sidenoteFootprint.top - room.ceiling;
        let headroom = previousSidenote ?
                       Math.min(maxHeadroom, (sidenoteFootprint.top - (previousSidenote.offsetTop + previousSidenote.clientHeight))) :
                       maxHeadroom;
        GWLog(`We have ${headroom}px of headroom.`);

        //  If we have enough headroom, simply move the sidenote up.
        if (headroom >= overlapBelow) {
            GWLog(`There is enough headroom. Moving sidenote ${sidenote.id.substr(2)} up.`);
            sidenote.style.top = (parseInt(sidenote.style.top) - overlapBelow) + "px";
            continue;
        } else {
            //  We donâ€™t have enough headroom!
            GWLog(`There is not enough headroom to move sidenote ${sidenote.id.substr(2)} all the way up!`);

            /*  If thereâ€™s overlap with the roomâ€™s floor, and the headroom is
                insufficient to clear that overlap, then we will have to move
                the current sidenote to the next open space, and try laying it
                out again.
                */
            if (headroom < overlapWithFloor) {
                sidenote.style.top = (proscribedVerticalRanges[nextProscribedRangeAfterSidenote].bottom + GW.sidenotes.sidenoteSpacing) + "px";
                i--;
                continue;
            }

            /*  If the headroom is enough to clear the sidenoteâ€™s overlap with
                the roomâ€™s floor (if any), then it must be insufficient to clear
                the overlap with the next sidenote. Before we try moving the
                current sidenote up, we check to see whether the *next* sidenote
                will fit in the remaining space of the current room. If not,
                then that next sidenote will need to be moved to the next open
                space, and the current sidenote need not be disturbed...
                */
            if ((sidenoteFootprint.bottom + nextSidenote.clientHeight + GW.sidenotes.sidenoteSpacing - headroom) >
                proscribedVerticalRanges[nextProscribedRangeAfterSidenote].top)
                continue;

            //  Move the sidenote up as much as we can...
            GWLog(`Moving sidenote ${sidenote.id.substr(2)} up by ${headroom} pixels...`);
            sidenote.style.top = (parseInt(sidenote.style.top) - headroom) + "px";
            //  Recompute overlap...
            overlapWithNextSidenote -= headroom;
            /*  And move the next sidenote down - possibly causing overlap.
                (But this will be handled when we process the next sidenote.)
                */
            GWLog(`... and moving sidenote ${nextSidenote.id.substr(2)} down by ${overlapWithNextSidenote} pixels.`);
            nextSidenote.style.top = (parseInt(nextSidenote.style.top) + overlapWithNextSidenote) + "px";
        }
    }

    //  Show the sidenote columns.
    GW.sidenotes.sidenoteColumn.style.visibility = "";
}

/*  Constructs the HTML structure, and associated listeners and auxiliaries,
    of the sidenotes.
    */
function constructSidenotes() {
    GWLog("constructSidenotes");

    /*  Do nothing if sidenotes.js somehow gets run extremely early in the page
        load process.
        */
    let markdownBody = document.querySelector("div.content");
    if (!markdownBody) return;

    // Pavel: account for my specific use case:
    GW.sidenotes.sidenoteColumn = document.querySelector("#sidenote-column");

    /*  Create and inject the sidenotes.
        */
    GW.sidenotes.sidenoteDivs = [ ];
    //  The footnote references (citations).
    GW.sidenotes.footnoteRefs = Array.from(document.querySelectorAll("a.footnote"));
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        //  Create the sidenote outer containing block...
        let sidenote = document.createElement("div");
        sidenote.classList.add("sidenote");
        const linkText = GW.sidenotes.footnoteRefs[i].href;
        const anchorText = linkText.slice(linkText.indexOf("#") + 4);
        sidenote.id = "sn:" + anchorText;
        let referencedFootnote = document.querySelector(GW.sidenotes.footnoteRefs[i].hash.replace(/:/, "\\:"));
        sidenote.innerHTML = (referencedFootnote ? referencedFootnote.innerHTML : "Loading sidenote contents, please waitâ€¦");
        //  Add the sidenote to the sidenotes array...
        GW.sidenotes.sidenoteDivs.push(sidenote);
        let side = GW.sidenotes.sidenoteColumn;
        //  Inject the sidenote into the page.
        side.appendChild(sidenote);
    }

    /*  Create & inject the sidenote self-links (i.e., boxed sidenote numbers). 
        TK: Pavel's note: This works only as long as there is only one reference in the text to each footnote
                          and I changed this to point to the link source.
        */
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let sidenoteSelfLink = document.createElement("a");
        sidenoteSelfLink.classList.add("sidenote-self-link");
        const linkText = GW.sidenotes.footnoteRefs[i].href;
        const anchorText = linkText.slice(linkText.indexOf("#") + 4);
        sidenoteSelfLink.href = "#fnref:" + anchorText;
        sidenoteSelfLink.textContent = (i + 1);
        GW.sidenotes.sidenoteDivs[i].children[0].prepend(sidenoteSelfLink);
    }

    /*  Insert zero-width spaces after problematic characters in sidenotes.
        (This is to mitigate justification/wrapping problems.)
        */
    GW.sidenotes.problematicCharacters = '/=â‰ ';
    GW.sidenotes.sidenoteDivs.forEach(sidenote => {
        sidenote.querySelectorAll("*").forEach(element => {
            if (element.closest(".sourceCode")) return;
            element.childNodes.forEach(node => {
                if (node.childNodes.length > 0) return;
                node.textContent = node.textContent.replace(new RegExp("(\\w[" + GW.sidenotes.problematicCharacters + "])(\\w)", 'g'), "$1\u{200B}$2");
            });
        });
    });
}

function addBreakpointListener(query) {
    const breakpoint = window.matchMedia(query);
    breakpoint.addEventListener('change', function(e) {
        updateSidenotePositions();
        updateFootnoteEventListeners();
        updateFootnoteReferenceLinks();
    });
  }

/******************/
/* INITIALIZATION */
/******************/

/*  Q:  Why is this setup function so long and complex?
    A:  In order to properly handle all of the following:

    1.  The two different modes (footnote popups vs. sidenotes)
    2.  The interactions between sidenotes and collapse blocks
    3.  Linking to footnotes/sidenotes
    4.  Loading a URL that links to a footnote/sidenote
    5.  Disclosing too-long sidenotes (and otherwise interacting with sidenotes)
    6.  Changes in the viewport width dynamically altering all of the above

    â€¦ and, of course, correct layout of the sidenotes, even in tricky cases
    where the citations are densely packed and the sidenotes are long.
    */
function sidenotesSetup() {
    GWLog("sidenotesSetup");

    /*  The `sidenoteSpacing` constant defines the minimum vertical space that
        is permitted between adjacent sidenotes; any less, and they are
        considered to be overlapping.
        */
    GW.sidenotes = {
        sidenoteSpacing: 16
    };

    const updateAll = function() {

    };

    // Add listener for window width changes
    addBreakpointListener("(max-width:  991px)");
    addBreakpointListener("(max-width: 1199px)");

    /*  Construct the sidenotes immediately, and also re-construct them as soon
        as the HTML content is fully loaded (if it isn't already).
        */
    if (document.readyState == "loading") {
        window.addEventListener("DOMContentLoaded", constructSidenotes);
    } else {
        constructSidenotes();
    }

    /*  Add a resize listener so that sidenote positions are recalculated when
        the window is resized.
        */
    // window.addEventListener('resize', GW.sidenotes.windowResized = (event) => {
    //     GWLog("GW.sidenotes.windowResized");

    //     updateSidenotePositions();
    // });
    /*  Lay out the sidenotes as soon as the document is loaded.
        */
    if (document.readyState == "complete") {
        updateSidenotePositions();
    } else {
        if (document.readyState == "loading") {
            window.addEventListener("DOMContentLoaded", updateSidenotePositions);
        } else {
            updateSidenotePositions();
        }
        window.addEventListener("load", updateSidenotePositions);
    }

    /*  On page load, set the correct mode (footnote popups or sidenotes), and
        rewrite the citation (footnote reference) links to point to footnotes
        or to sidenotes, as appropriate.
        */
    if (document.readyState == "complete") {
        updateFootnoteEventListeners();
        updateFootnoteReferenceLinks();
    } else {
        window.addEventListener("load", () => {
            updateFootnoteEventListeners();
            updateFootnoteReferenceLinks();
        });
    }

    /*  If the page was loaded with a hash that points to a footnote, but
        sidenotes are enabled (or vice-versa), rewrite the hash in accordance
        with the current mode (this will also cause the page to end up scrolled
        to the appropriate element - footnote or sidenote).
        */
    if (location.hash.match(/#sn:/) &&
            (window.innerWidth < 992) ) {
        location.hash = "#fn:" + location.hash.slice(4);
    } else if (location.hash.match(/#fn:/) &&
            (window.innerWidth >= 992) ) {
        location.hash = "#sn:" + location.hash.slice(4);
    } else {
        /*  Otherwise, make sure that if a sidenote is targeted by the hash, it
            indeed ends up looking highlighted (this defeats a weird bug).
            */
        requestAnimationFrame(realignHashIfNeeded);
    }

    /*  Having updated the hash, now properly highlight everything, if needed,
        and add a listener to update the target counterpart if the hash changes
        later.

        Also, if the hash points to a collapse block, or to an element within a
        collapse block, expand it and all collapse blocks enclosing it.
        */
    window.addEventListener("hashchange", GW.sidenotes.hashChanged = () => {
        GWLog("GW.sidenotes.hashChanged");

        revealTarget();
        updateTargetCounterpart();
    });
    window.addEventListener("load", () => {
        revealTarget();
        updateTargetCounterpart();
    });

    /*  Add event listeners to (asynchronously) recompute sidenote positioning
        when a collapse block is manually collapsed or expanded.
        */
    // document.querySelectorAll(".disclosure-button").forEach(collapseCheckbox => {
    //     collapseCheckbox.addEventListener("change", GW.sidenotes.disclosureButtonValueChanged = (event) => {
    //         GWLog("GW.sidenotes.disclosureButtonValueChanged");

    //         setTimeout(updateSidenotePositions);
    //     });
    // });

    //  Prepare for hash reversion.
    /*  Save the hash, if need be (if it does NOT point to a sidenote or a
        footnote reference).
        */
    GW.sidenotes.hashBeforeSidenoteWasFocused = (location.hash.hasPrefix("#sn:") || location.hash.hasPrefix("#fnref:")) ?
                                                "" : location.hash;
    /*  Add event listener to un-focus a sidenote (by resetting the hash) when
        then document is clicked anywhere but a sidenote or a link.
        */
    document.body.addEventListener("click", GW.sidenotes.bodyClicked = (event) => {
        GWLog("GW.sidenotes.bodyClicked");

        if (!(event.target.tagName == "A" || event.target.closest(".sidenote")) &&
            (location.hash.hasPrefix("#sn:") || location.hash.hasPrefix("#fnref:"))) {
            setHashWithoutScrolling(GW.sidenotes.hashBeforeSidenoteWasFocused);
        }
    });
}

//  LET... THERE... BE... SIDENOTES!!!
sidenotesSetup();