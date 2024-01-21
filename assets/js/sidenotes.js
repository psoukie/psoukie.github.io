/* sidenotes.js: standalone JS library for parsing HTML documents with Pandoc-style footnotes and dynamically repositioning them into the left/right margins, when browser windows are wide enough.
Sidenotes are superior to footnotes where possible because they enable the reader to immediately look at them without requiring user action to 'go to' or 'pop up' the footnotes; even floating footnotes require effort by the reader.
sidenotes.js is inspired by the Tufte-CSS sidenotes (https://edwardtufte.github.io/tufte-css/#sidenotes), but where Tufte-CSS uses static footnotes inlined into the body of the page (requiring modifications to Pandoc's compilation), which doesn't always work well for particularly long or frequent sidenotes, sidenotes.js will rearrange sidenotes to fit as best as possible, and will respond to window changes.
Particularly long sidenotes are also partially 'collapsed'.
Author: Said Achmiz
2019-03-11
license: MIT (derivative of footnotes.js, which is PD)
*/

var timeout = false,
    delay = 250,
    lastsize = 0; //1 - small, 2 - large

if (typeof window.GW == "undefined")
    window.GW = { };

/********************/
/* DEBUGGING OUTPUT */
/********************/

function GWLog (string) {
  // console.log(string);
}

/***********/
/* HELPERS */
/***********/


/*  This is necessary to defeat a bug where if the page is loaded with the URL
    hash targeting some element, the element does not match the :target CSS
    pseudo-class.
    */
function realignHashIfNeeded() {
    GWLog("realignHashIfNeeded");

    if (location.hash.match(/#sn[0-9]/) || location.hash.match(/#fnref[0-9]/))
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
    if (GW.isFirefox)
        selectedRange = window.getSelection().getRangeAt(0);

    let scrollPositionBeforeNavigate = window.scrollY;
    location.hash = newHash;
}


/*  Returns true if the string begins with the given prefix.
    */
String.prototype.hasPrefix = function (prefix) {
    return (this.lastIndexOf(prefix, 0) === 0);
}

/*******************/
/* COLLAPSE BLOCKS */
/*******************/

/*  Returns true if the given collapse block is currently collapsed.
    NOTE: This does not count targeted collapse blocks as expanded unless
    their disclosure button is also engaged (i.e., in the checked state).
    This is deliberate! (Because we use the disclosure button state to
    determine whether we need to recompute layout.)
    */
function isCollapsed(collapseBlock) {
    let collapseCheckbox = collapseBlock.querySelector(".disclosure-button");
    return (collapseCheckbox.checked == false);
}

/*  Returns true if the given element is within a currently-collapsed collapse
    block.
    */
function isWithinCollapsedBlock(element) {
    /*  If the element is not within a collapse block at all, it obviously can't
        be within a *currently-collapsed* collapse block.
        */

    let collapseParent = element.closest(".collapse");
    if (!collapseParent) return false;

    /*  If the element is within a collapse block and that collapse block is
        currently collapsed, then the condition is satisfied...
        */
    if (isCollapsed(collapseParent)) return true;

    /*  BUT the collapse block that the element is in, even if *it* is not
        itself collapsed, could be *within* another collapse block!
        */
    return isWithinCollapsedBlock(collapseParent.parentElement);
}

/*  This function expands all collapse blocks containing the given element, if
    any (including the element itself, if it is a collapse block). Returns true
    if any such expansion occurred.
    */
function expandCollapseBlocksToReveal(element) {
    GWLog("expandCollapseBlocksToReveal");

    /*  If the given element is not within any collapse block, there is nothing
        to do.
        */
    if (!isWithinCollapsedBlock(element)) return false;

    //  Expand the nearest collapse block.
    let collapseParent = element.closest(".collapse");
    let disclosureButton = collapseParent.querySelector(".disclosure-button");
    let expansionOccurred = (disclosureButton.checked == false);
    disclosureButton.checked = true;
    collapseParent.classList.toggle("expanded", disclosureButton.checked);

    //  Expand any higher-level collapse blocks!
    /*  Update sidenote positions only if we do NOT have to do any further
        expansion (otherwise we'll do redundant layout).
        */
    if (!expandCollapseBlocksToReveal(collapseParent.parentElement) && expansionOccurred)
        setTimeout(updateSidenotePositions);

    //  Report whether we had to expand a collapse block.
    return expansionOccurred;
}

/*  This function expands all necessary collapse blocks to reveal the element
    targeted by the URL hash. (This includes expanding collapse blocks to
    reveal a footnote reference associated with a targeted sidenote). It also
    scrolls the targeted element into view.
    */
function revealTarget() {
    GWLog("revealTarget");

    if (!location.hash) return;

    let target = document.querySelector(decodeURIComponent(location.hash));
    if (!target) return;

    /*  What needs to be revealed is not necessarily the targeted element
        itself; if the target is a sidenote, expand collapsed blocks to reveal
        the citation reference.
        */
    let targetInText = location.hash.match(/#sn[0-9]/) ?
                       document.querySelector("#fnref" + location.hash.substr(3)) :
                       target;
    expandCollapseBlocksToReveal(targetInText);

    //  Scroll the target into view.
    target.scrollIntoView();
}

/*  Move sidenotes within currently-collapsed collapse blocks to the hidden
    sidenote storage container (#hidden-sidenote-storage). Conversely, move
    sidenotes within currently-expanded collapse blocks from the hidden sidenote
    storage container to the appropriate sidenote column.
    */
function updateSidenotesInCollapseBlocks() {
    GWLog("updateSidenotesInCollapseBlocks");

    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let fnref = GW.sidenotes.footnoteRefs[i];
        let sidenote = GW.sidenotes.sidenoteDivs[i];

        //  If the enclosing collapse block is currently collapsed...
        if (isWithinCollapsedBlock(fnref)) {
            //  Move the sidenote to the hidden sidenote storage.
            GW.sidenotes.hiddenSidenoteStorage.appendChild(sidenote);
            continue;
        }

        //  Otherwise, move the sidenote back into the correct sidenote column.
        let side = GW.sidenotes.sidenoteColumn;
        //  What's the next sidenote?
        var nextSidenoteIndex = i + 2;
        while (nextSidenoteIndex < GW.sidenotes.footnoteRefs.length &&
               GW.sidenotes.sidenoteDivs[nextSidenoteIndex].parentElement == GW.sidenotes.hiddenSidenoteStorage)
               nextSidenoteIndex += 2;
        if (nextSidenoteIndex >= GW.sidenotes.footnoteRefs.length) {
        /*  If no subsequent sidenote is displayed, append the current sidenote
            to the column.
            */
            side.appendChild(sidenote);
        } else {
        /*  Otherwise, insert it before the next displayed sidenote.
            */
            side.insertBefore(sidenote, GW.sidenotes.sidenoteDivs[nextSidenoteIndex]);
        }
    }
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

    let footnoteAnchors = Array.from(document.querySelectorAll("div.footnotes li[id^='fn:']"));

    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let fnref = GW.sidenotes.footnoteRefs[i];
        if (window.innerWidth >= 992) {
            fnref.href = "#sn" + (i + 1);
        } else {
            fnref.href = "#fn" + (i + 1);
            footnoteAnchors[i].id = "fn" + (i + 1);
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
        if (window.Footnotes) {
            //  Unbind footnote events.
            Footnotes.unbind();
        }

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
        clearFootnotePopups();
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

        if (window.Footnotes && window.innerWidth > 992) {
            //  Bind footnote events.
            Footnotes.setup();
        }
    }
}

/*  In some rare cases, we might switch to sidenote mode while a footnote popup
    is on the screen. Since we remove footnote popup event listeners during the
    switch, that popup will remain there forever... unless we clean it up.
    */
function clearFootnotePopups() {
    GWLog("clearFootnotePopups");

    document.querySelectorAll("#footnotediv").forEach(footnotePopup => { footnotePopup.remove(); });
}

/**********/
/* LAYOUT */
/**********/

/*  This function actually calculates and sets the positions of all sidenotes.
    */
function updateSidenotePositions() {
  GWLog("updateSidenotePositions");
    /*  If we're in footnotes mode (i.e., the viewport is too narrow), then
        don't do anything. soukie TK this is based on breakpoint.
        */
    if (window.innerWidth < 992)
        return;

    /*  Position left sidenote column so top is flush with top of first
        full-width block (i.e., one that is not pushed right by the TOC).
        NOTE: This doesnâ€™t quite do what it says (due to overflow), but thatâ€™s
        fine; nothing really breaks as a result...
        */
    let markdownBody = document.querySelector("div.content");
    let offset = markdownBody.offsetTop || 0;
/*    if (GW.sidenotes.sidenoteColumn.offsetTop < firstFullWidthBlock.offsetTop) {
        GW.sidenotes.sidenoteColumn.style.top = offset + "px";
        GW.sidenotes.sidenoteColumn.style.height = `calc(100% - ${offset}px)`;
    }
*/
    //  Update the disposition of sidenotes within collapse blocks.
    updateSidenotesInCollapseBlocks();

    /*  Initial layout (to force browser layout engine to compute sidenotesâ€™
        height for us).
        */
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let sidenote = GW.sidenotes.sidenoteDivs[i];

        /*  Check whether the sidenote is in the hidden sidenote storage (i.e.,
            within a currently-collapsed collapse block. If so, skip it.
            */
        if (sidenote.parentElement == GW.sidenotes.hiddenSidenoteStorage)
            continue;

        //  What side is this sidenote on?
        let side = GW.sidenotes.sidenoteColumn;

        //  Default position (vertically aligned with the footnote reference).
        sidenote.style.top = Math.round(((GW.sidenotes.footnoteRefs[i].getBoundingClientRect().top) - side.getBoundingClientRect().top) ) + "px";

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

        /*  Is this sidenote even displayed? Or is it hidden (i.e., within
            a currently-collapsed collapse block)? If so, skip it.
            */
        if (sidenote.parentElement == GW.sidenotes.hiddenSidenoteStorage) continue;

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
                GWLog("TOO MUCH SIDENOTES. GIVING UP. :(");
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
    let headerBar = document.querySelector("main > header");
    let aboutBar = document.querySelector("#about-column");
    let metaWidth = 0;
    if (window.innerWidth >= 992 && window.innerWidth < 1200) {
        const headerHeight = headerBar ? headerBar.clientHeight : 0;
        const aboutHeight = aboutBar ? aboutBar.clientHeight : 0;
        metaWidth = headerHeight + aboutHeight + 32;
    }
    if (!markdownBody) return;

    /*  Add the sidenote columns (removing them first if they already exist).
        */
    // if (GW.sidenotes.sidenoteColumn) GW.sidenotes.sidenoteColumn.remove();
    // markdownBody.parentNode.insertAdjacentHTML("beforeend",
    //     "<div id='sidenote-column' class='footnotes' style='visibility:hidden'></div>");
    GW.sidenotes.sidenoteColumn = document.querySelector("#sidenote-column");
    GW.sidenotes.sidenoteColumn.style.height = markdownBody.clientHeight - metaWidth + "px";

    /*  Create and inject the sidenotes.
        */
    GW.sidenotes.sidenoteDivs = [ ];
    //  The footnote references (citations).
    GW.sidenotes.footnoteRefs = Array.from(document.querySelectorAll("a.footnote"));
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        //  Create the sidenote outer containing block...
        let sidenote = document.createElement("div");
        sidenote.classList.add("sidenote");
        sidenote.id = "sn" + (i + 1);

        let referencedFootnote = document.querySelector(GW.sidenotes.footnoteRefs[i].hash.replace(/:/, "\\:"));
        sidenote.innerHTML = (referencedFootnote ? referencedFootnote.innerHTML : "Loading sidenote contents, please waitâ€¦");
        //  Add the sidenote to the sidenotes array...
        GW.sidenotes.sidenoteDivs.push(sidenote);
        let side = GW.sidenotes.sidenoteColumn;
        //  Inject the sidenote into the page.
        side.appendChild(sidenote);
    }

    /*  Create & inject the sidenote self-links (i.e., boxed sidenote numbers).
        */
    for (var i = 0; i < GW.sidenotes.footnoteRefs.length; i++) {
        let sidenoteSelfLink = document.createElement("a");
        sidenoteSelfLink.classList.add("sidenote-self-link");
        sidenoteSelfLink.href = "#sn" + (i + 1);
        sidenoteSelfLink.textContent = (i + 1);
        GW.sidenotes.sidenoteDivs[i].children[0].prepend(sidenoteSelfLink);
    }

    /*  Create & inject the hidden sidenote storage (for sidenotes within
        currently-collapsed collapse blocks).
        */
    if (GW.sidenotes.hiddenSidenoteStorage) GW.sidenotes.hiddenSidenoteStorage.remove();
    GW.sidenotes.hiddenSidenoteStorage = document.createElement("div");
    GW.sidenotes.hiddenSidenoteStorage.id = "hidden-sidenote-storage";
    GW.sidenotes.hiddenSidenoteStorage.style.display = "none";
    markdownBody.appendChild(GW.sidenotes.hiddenSidenoteStorage);


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

function sidenotesSetupInner() {
  constructSidenotes();
  updateSidenotePositions();
  updateFootnoteEventListeners();
  updateFootnoteReferenceLinks();
  setTimeout(updateSidenotePositions, 5000); // soukie -- in case of late shifts because of slow loading of fonts etc.
}

function sidenotesSetup() {
    GWLog("sidenotesSetup");

    /*  The `sidenoteSpacing` constant defines the minimum vertical space that
        is permitted between adjacent sidenotes; any less, and they are
        considered to be overlapping.
        */
    GW.sidenotes = {
        sidenoteSpacing:    16
    };

    /*  Construct the sidenotes immediately, and also re-construct them as soon
        as the HTML content is fully loaded (if it isn't already).
        */
    // constructSidenotes();
    //if (document.readyState == "loading")

    // window.addEventListener("load", constructSidenotes);

    // window.addEventListener("load", updateSidenotePositions);

    // if (document.readyState!='loading') sidenotesSetupInner();
    //     // modern browsers
    //     else if (document.addEventListener) document.addEventListener('DOMContentLoaded', sidenotesSetupInner);
    //     // IE <= 8
    //     else document.attachEvent('onreadystatechange', function(){
    //         if (document.readyState=='complete') sidenotesSetupInner();
    //     });

        window.addEventListener("load", sidenotesSetupInner);

    /*  Add a resize listener so that sidenote positions are recalculated when
        the window is resized. */

    window.addEventListener('resize', function() {
      clearTimeout(timeout);
      timeout = setTimeout(updateSidenotePositions, delay);
    });

    /*  If the page was loaded with a hash that points to a footnote, but
        sidenotes are enabled (or vice-versa), rewrite the hash in accordance
        with the current mode (this will also cause the page to end up scrolled
        to the appropriate element - footnote or sidenote).
        */
    if (location.hash.match(/#sn[0-9]/) &&
        (window.innerWidth < 992) ) {
        location.hash = "#fn" + location.hash.substr(3);
    } else if (location.hash.match(/#fn[0-9]/) &&
        (window.innerWidth >= 992) ) {
        location.hash = "#sn" + location.hash.substr(3);
    }
}

//  LET... THERE... BE... SIDENOTES!!!

document.addEventListener('DOMContentLoaded', sidenotesSetup);