---
title: Series
permalink: /series
description: A list of all article series on this website.
toc: true
---

{%- for serie in site.series -%}
  <h2 id='{{ serie.title | slugify }}'>{{ serie.title | strip }}</h2>
  {%- for note in site.notes -%}
    {%- if note.categories contains serie.category -%}
{% include snippet.html %}
    {%- endif -%}
  {%- endfor -%}
{%- endfor -%}
