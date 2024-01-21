---
title: "ZipChord: Hybrid Chorded Keyboard"
subtitle: Faster and More Comfortable Typing
image: ZipChord-chart.png
caption: "Frequency of the top 100 most used words in 'The Lord of the Rings,' demonstrating Zipf's law in action. The most frequent word makes up 6% of all words in the text."
lede: true
series: technology-ai
date: 2021-04-23
updated: 2022-02-09
authograph-label: HHH
authograph-link: https://authograph.com/view?r=WfBxBBRDdY
---

Thanks to Zipf’s law, it takes only a small number of chorded shortcuts to improve one half of all the typing we do.

Trained stenographers type at over 200 words per minute. This is because stenotype machines use chords of simultaneous key presses to input whole words at a time. Unsurprisingly, it takes _years_ to master this skill.

> 40% of the total word count in _The Lord of the Rings_ consists of only 32 words.
{:.float}

Because languages follow Zipf’s law -- the second most frequent word appears half as often as the first, the third one appears one third as often as the first, etc. -- it turns out that half of all our written text is made out of just about 100 words. When I did a quick check on _The Lord of the Rings_, that number was 66 words.

How many words do you think it takes in your writing? And what if you had a way to enter just those frequent words really efficiently?

**A keyboard input that could accept normal typing as well as simple chords for a few dozen words would make a hugely disproportionate impact on the amount of typing.**

While there are software tools for chorded entry, I could not find any tool or script that decently handles a hybrid of regular typing together with chords of more than two keys. Because I knew chorded entry would bring greater comfort and speed even if used with only a few chords, I created _ZipChord_ and made it available for free.

# Benefits

_ZipChord_ allows you to define your own chords on the fly while you type, and to mix them in with regular typing. As discussed above, even a modest number of chords can replace a significant amount of typing. In addition, _ZipChord_ has a few more tricks that make typing easier:

## Smart Spaces

When mixing chords and normal typing, _ZipChord_ is inserting (and removing) extra spaces as needed: When you enter a word using a chord, it will end with a ‘smart space,’ so you are ready to start typing or chording the next word.

Similarly, when you complete a word using regular typing and the following word is entered using a chord, the chorded word will start with a smart space, so you can save yourself from pressing the space bar.

## Punctuation and Capitalization

When a chord appears before or after a punctuation mark, _ZipChord_ takes care of the smart space -- moving the punctuation and space to the right locations -- but it also automatically capitalizes the chorded word.

The spaces and capitalization around punctuation marks is normally enhanced only around the chorded words (to leave normal keyboard behavior when not entering chords) but this functionality can be turned on or off for all text entry.

This way, _ZipChord_ can add spaces and capitalize words for you as you type.

## Prefixes and Suffixes

Many words like ‘doing,’ ‘station’ or ‘sadly’ use suffixes. You can easily define chords for suffixes. The suffixes get appended to words whether they were entered by typing or chording. (As above, the smart space would disappear automatically.)

Suffixes such as ‘-ing,’ ‘-ation,’ and even ‘-ly’ are all worth turning into chords. With one press, you add the whole suffix _and_ a smart space. It may even makes sense to define a chord for ‘-s’ for plurals and verbs in third person singular, especially for words typed using a chord.

Note: _ZipChord_ does not observe grammar. If you press chords for _take_ and ~_ing_, it would produce _takeing_. But you can create a separate special chord for '-ing' which also removes the last letter of the preceding word.

## Programming

Custom chords are also useful for developers. You can easily define that a brief press of `W` and `H` would produce `while (  )` with the cursor in the middle of the parentheses, ready for you to type the condition.

# That’s nice, but…

## … frequent words are short

It is true that the most frequent words tend to also be fairly short. In the text I analyzed, the average length of the top 100 words is 3.4 characters. Is the improvement worth it?

To type the most frequent word in English (_the_), you need to press and release _four_ keys in the correct sequence: `T`, `H`, `E`, and `Space`. To type it with _ZipChord_, you can press and release two keys simultaneously, and you can place them conveniently on the home row.

## … you need to learn the shortcuts

Yes, unfortunately. It is possible to make this process easier by mapping the chords to letters that make up the words or by using some logical structure that makes sense to you personally.

Depending on how you type, this could be hard or easy. I am a Dvorak typist, and the Dvorak layout lends itself extremely well to chording. Whether you follow existing keys or invent new combinations is up to you. Tricks like mirroring right and left hand for some keys can also help.

Because of Zipf’s law, each lower-ranked word brings diminishing returns. This takes the pressure off learning many chords. Even a few can make your typing more comfortable. And you can always use regular key entry.

## … not everyone types in English

The statistics given for English are a actually quite universal across all languages. There isn’t anything in _ZipChord_ that is language specific. with

## … it requires mental switching

This has been, in my experience, the biggest challenge. The more absorbed I get into something, the more often I forget to use chords where I could. On the other hand, even if I didn’t use _any_ chords for a while, my typing speed and comfort would not be negatively impacted.

## … sometimes it mistakes typing for a chord

If _ZipChord_ incorrectly converts a part of typing as a chord, it is because two or more keys were held down for longer than the chord recognition delay. There are three things you can do:

1.  Change the sensitivity setting. Try changing the number by 20ms at a time to find the right balance.
2.  Adjust your typing form. I have a bad habit of balancing my laptop in my lap by lingering on the keys I already pressed.
3.  If a specific combination tends to get in the way, you can consider changing the chord away from it.

## … not all keyboards support N-key rollover

Depending on the physical keyboard and the specific keys involved, the keyboard might not be able to correctly send all the keys to the computer.

While this limitation would be a blocker for stenotype emulation, if the goal is to define shortcuts for a few hundred words, your chords can be easily limited to mostly two- and some three-key chords. The vast majority of keyboards will process these chords correctly.

If your keyboard supports N-key rollover, you could even emulate a stenography machine and use it in parallel with regular typing with _ZipChord_.

## … it only works on Windows

I have not explored how the tool could be adapted for MacOS, but the source code is open so anyone is welcome to adapt the programming logic for a MacOS version.

# How to Use ZipChord

With ZipChord running, you can type everywhere using normal individual keystrokes and also using predefined ‘chords’ of several keys pressed at the same time to enter whole words at a time. Whether you enter words using individual strokes or chords, _ZipChord_ uses smart spaces and punctuation as needed.

To define a new chord (or to remind yourself of an already defined chord), select the word you want to define a chord for and press and hold `Ctrl-C` until a dialog box appears. If the selected text is already in the dictionary, _ZipChord_ will remind you of its chord. Otherwise, type individual keys that should make up the chord (without pressing Shift or any function keys) and click OK.

If you’d like to give a hybrid chording keyboard a try, you can easily install and use _ZipChord_ on Windows. Simply download the latest [_ZipChord_ release](https://github.com/psoukie/zipchord/releases) (zipchord.exe) from GitHub. You can find [documentation](https://github.com/psoukie/zipchord) there too. If you try _ZipChord_ or create an interesting dictionary for it, I’d love to hear from you: please leave a comment or contact me on Twitter at [@pavel_soukenik](https://twitter.com/pavel_soukenik).
