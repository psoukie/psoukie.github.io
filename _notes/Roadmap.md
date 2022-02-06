---
title: Roadmap
tags: [roadmap]
season: spring
date: 2022-01-20
updated: 2022-01-27
toc: true
published: false
---

This is a note-to-self.

Over the years, I either wrote the HTML, CSS and JavaScript for my websites either completely from scratch, or -- on occasions when I used templates to start -- I nevertheless eventually went through every single line in each file and adjusted them to my needs.

I was intrigued by some recent developments in writing web pages, such as digital gardens, which has prompted me to go back and resurrect my website. This way, I could also move my more recent writing away from a proprietary, commercial site back to my own website.

At first, I experimented with _Notenote.link_, which is in turn a fork of _Simply Jekyll_, because I wanted something compatible with _Obsidian_. At the same time though, I am not crazy about the idiosyncratic syntax of _Simply Jekyll_ and also, to make things like images work smoothly, it is better to switch _Obsidian_ to use Markdown links for images and links instead of its own short syntax.

## Workflow

Taken together, I decided I would rather have my workflow be based on:

Markdown editor --> GitHub Desktop --> GitHub Pages[^local]

[^local]: During the development of the website, I am building a local version using _Windows Linux Subsystem_ and _Jekyll_ in _Ubuntu_.

I can and will likely still use _Obsidian_ for the writing and checking of backlinks and what not. But I want the files to conform to simple Markdown syntax, which gives me the option to use any other Markdown editor (like _Typora_, or just _Atom_). And even though I have used more complex setups -- with Windows Linux Subsystem, GitHub and Netlify or Amazon Amplify -- for other websites, the ability to keep things simply on GitHub Pages is intriguing and suitable for a minimalist website. And once I get to GitHub, I want to keep things simple there too:

- I like the classless CSS approaches, and settled on _[Pico](https://picocss.com)_ for CSS.
- then creating my own Jekyll template from scratch because I want to keep it basic, and it is too much  work for me to comb someone else's code to whittle it down to what I want
- But because Markdown is completely un-semantic, I will write some transforms in Liquid for Markdown's [syntax](#syntax) to turn elements such as `blockquote` to `aside`, using the approach described [here](https://alexgude.com/blog/custom-markdown-for-github-pages/)
- and because I like to use footnotes and fact boxes extensively, I need to reuse or build support for these.

For turning footnotes into sidenotes, Said Achmiz's [sidenotes.js](https://gist.github.com/mandarg/c37ea778a1b3cd4947dfa2dd66ef7d12) looks promising. I will still think about whether I want the footnotes displayed as tooltip on smaller screens.

## Design

I have self-studied typography when I was a teenager, and my first job was at Ando Publishing which was still in the book publishing business when I joined, so typography and design matter to me -- even though I don't consider myself a professional.

For the new incarnation of Soukie's Place, I'm contemplating using Microsoft [Fluent](https://www.microsoft.com/design/fluent/) design language. The first reason is to acknowledge that I'm designing for the screen (and usually, physically, a very small screen) and should keep myself away from design principles that come from the printed world. The second reason is to borrow from someone who has done design for a long time, and done it well.[^msft]

[^msft]: This, of course, is a matter of taste and opinion, but I do feel Microsoft has proven they keep ahead of the curve -- a good example was their Metro design language which made, at the time, look Apple's skeuomorphic design quite dated).

See details about [this site's design](soukies-place-design).

## Syntax

I am planning the following transforms on Markdown syntax when rendering as HTML pages. These are motivated by an effort to keep the HTML semantically correct, and the need to generate specific styles I want without classes and without making Markdown source files broken when opened with a pure Markdown editor.

- **Boxes**: Shaded blocks of text within the body.
- **Factboxes**: Same as boxes but floated to the side within the margins of body if screen width allows.

| Component  | Markdown  | Rendered HTML               |
| :--------  | :-------- | :-------------------------- |
| Pull quote | `>  `<br />`{: .float}` | `<aside class="pullquote">` |
| Box        | `>> `     | `<div class="box">`         |
| Factbox    | `>> `<br />`{: float}`  | `<aside class="box">`       |
| Quotation  | `> `      | `<blockquote>`              |

## YAML Tricks

- The first paragraph of the article can be formatted as a lede paragraph using YAML `lede: true`
- The headings in the source Markdown can be shifted by one (h1 to h2 etc.) with `shift-headings: true`

## Page Structure

Use the following:

````
<html>
  <body>
    <header>
	  <nav/>
	</header>
  	<main>
	  <header>
	    <meta />
		<nav />
	  </header>
	  <article>
	    $content
	  </article>
	  <footer />
	</main>
  <footer>
</html>
````


## To Do

So here is what I need to do:

### V.1

- [X] Install Pico.css
- Build basic theme structure:
	- [ ] basic header without menu
	- [X] index page (list of articles / recent changes)
- [X] Theme colors and dynamic font size
- [ ] CSS styles based on  Fluid design
- [X] Create Markdown conversions (fact boxes, pull quotes)
- [ ] Markup conversion or formatting for image captions
- [X] Build support for footnotes / sidenotes
- [ ] Fix bug footnotes when reloading


### V.2
- [ ] SEO
- [ ] Feed
- [ ] Simplify and fix sidenotes.js
- [ ] Tidy up CSS styles and ensure design compliance
- [ ] Comments
- [ ] Search feature
- [ ] tags page
- [ ] categories page(s) - borrow from cxogrow
- [ ] Anonymized traffic tracking
