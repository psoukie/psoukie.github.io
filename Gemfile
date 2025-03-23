source "https://rubygems.org"

# Use GitHub Pages for deployment compatibility
gem "github-pages", "~> 228", group: :jekyll_plugins

# Optional: keep if you're using a custom theme
# gem "minima", "~> 2.5"

# Optional: extra plugins that GitHub Pages doesn't include
gem "faraday-retry"
gem "jekyll-sitemap"
gem "jekyll-toc"
gem "webrick"
# gem "jekyll-relative-links"  # should be handled by GitHub Pages

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]