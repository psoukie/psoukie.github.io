---
title: "Intelligence in AI:<br/> Seeing Past the Symbols"
subtitle: "Part 1: Machines, Understanding, and Intelligence"
slug: intelligence-in-ai
date: 2024-02-14
series: technology-ai
image: ILY.jpg
caption: Sculpture ‘I.L.Y.’ by Dan Mountain, photographed by IMustBeDead, moon by Alex Andrews.
description: Explore how the debate on large language models’ (LLMs) capacity for understanding sheds light on the strengths, limitations, and future of machine intelligence.
authograph-label: CHC
authograph-link: https://authograph.com/view?r=TBcbBKbUCu
lede: true
preserve-headings: true
---

The debate surrounding large language models’ (LLMs) capacity for understanding presents a window into their capabilities and the future of machine intelligence. Drawing from a range of expert opinions, this article explores what it reveals about the strengths and weaknesses of current models and the path toward human-level intelligence in&nbsp;AI.

<a href="https://authograph.com/view?r=ZQvxiBShAa" title="Authograph details" class="authograph">CHC</a>[^atg] The nature of comprehension in LLMs has provoked a vibrant debate. While the nuances are crucial for researchers and engineers working on mitigating their downsides and advancing their capabilities, they have significance for anyone engaged with generative AI or interested in the future of machine learning.

By surveying different perspectives and the special role of symbols and meaning in this debate, this article aims to enrich our understanding of LLM’s strengths, mitigation strategies, and assess how their practical success might shape the journey toward machines with human-level performance.

## Machines, Understanding, and Intelligence: A Survey

The notion of ‘understanding’ in the context of large language models (LLMs) is a subject of ongoing debate. The differing views stem from several sources: the definitions of terms such as ‘understanding,’ ‘meaning,’ and ‘intelligence;’ conceptual differences on how closely symbols (like words) relate to the concepts they represent; and from tangible observations about the systems.

Given that language serves as both the subject and the instrument in this discussion, a note on some anthropomorphic descriptions in this article is pertinent. As Phillip Brooker, William Dutton, and Michael Mair observe, “While [these] may be useful or indeed harmless, when taken at face value . . . they generate a false picture of algorithms as well as our own thinking and reasoning practices by treating them as analogues of one another.”[^brooker]

Therefore, although our language does not alter the nature of any technology, we should be mindful how it shapes perceptions and dialogues.

As we explore the perspectives of leading researchers, it is important to notice where their views differ because of a nuance in definition, conflicting models of meaning, or inherent properties of AI systems.

### The Limits of Language

In *AI and the Limits of Language*, Jacob Browning alongside Yann LeCun, whose work on convolutional neural networks propelled advances in machine learning, scrutinize the capabilities and limitations of language-based AI models. They argue that the high level of abstraction of language makes it impossible for an LLM—of any scale—to approximate human intelligence, and caution that “just because a machine can talk about anything, that doesn’t mean it understands what it is talking about.”[^browning-lecun]

The authors use the term ‘shallow understanding’ to encapsulate both the impressive results LLMs produce and the underlying mechanisms masking the lack of deep comprehension.[^b-l]

In a recent lecture at the University of Washington, LeCun pointed out that despite the significant utility and value of systems such as LlaMA, LaMDA/Bard, and ChatGPT, these models have definite limits because they “don’t have any common sense, . . . can’t plan, [and] don’t really understand the physical world.”[^lecun]

LeCun firmly asserts that machines will eventually surpass human performance in all domains, but he anticipates this will be achieved through other methods. He believes that intrinsic limitations of autoregressive LLMs do not permit them to reach “anywhere close to human or even animal intelligence.”[^l-2]

While the scientific community has a range of views, LeCun’s perspective as Meta’s Chief AI Scientist at the forefront of LLM is a sobering reminder of the hurdles in overcoming these challenges.

These critiques underscore that the difference between the ability to successfully manipulate language and genuine understanding is far beyond semantics, and represents an unsolved challenge in the quest for machine intelligence.

### The Illusion of Understanding

The above argument also points to a gap between the capability of generative AI as we perceive it, and the capability as it actually is. This gap and its source is highly relevant for our discussion.

In an IBM video addressing AI risk mitigation, Responsible AI leader Phaedra Boinodiris asserts: “Large language models may give a false impression that they possess actual understanding or meaning.” She makes an important connection by highlighting that the well-known tendency of generative AI to produce “flagrantly false narratives” (or ‘hallucinations’) arises “directly as a result of its calculated predictions versus a true understanding.”[^boinodiris]

In the seminal paper that introduced the term ‘stochastic parrot,’ linguist Emily M. Bender and Timnit Gebru, who was then co-lead of Ethical AI Research at Google, categorically state that although we are able to train LLMs to pass benchmarks for natural language understanding, “no actual language understanding is taking place in LM-driven approaches to these tasks.”[^bender-gebru] 

Their analysis focuses on potential risks of LLMs and their mitigations,[^parrot] but also addresses why it is so easy for us to see understanding and even communicative intent behind the output of generative models:
> Our perception of natural language text, regardless of how it was generated, is mediated by our own linguistic competence and our predisposition to interpret communicative acts as conveying coherent meaning and intent. [If] one side of the communication does not have meaning, then the comprehension of the implicit meaning is an illusion arising from our singular human understanding of language.[^b-g-2]

Alan Turing anticipated this phenomenon. Describing the experience of playing chess against his ‘paper machine,’[^turochamp] he observed, “Playing against such a machine gives a definite feeling that one is pitting one’s wit against something alive.” (Interestingly, he used this to argue the feasibility of constructing a machine which produces its own intelligent results that cannot be foreseen in any sort of detail by its creators.)[^turing]  

Echoing the idea that we might be projecting intelligence onto things devoid of it, Yann LeCun observed in the aforementioned lecture, “We’re easily fooled by their fluency into thinking that they are smart, but they really aren’t.”[^l-3] 

The contrast between AI in chess and language vividly illustrates these arguments:

Seventy years after his invention, Turing would likely have been thrilled by the mastery, deep understanding, and even artistry in chess exhibited by AlphaZero.[^alphazero] (Now running on Tensor Processing Units instead of paper.) Yet, despite my admiration for AlphaZero’s elegant design and innovative play, I perceive its evaluations as outputs of a sophisticated tool.

In contrast, using ChatGPT&nbsp;4 for feedback on my article’s structure manifests as a different experience. This, even though AlphaZero’s grasp of chess surpasses any human, while essentially the opposite is true of LLMs and humans in the language domain.[^open]

### Capturing the Meaning

The scholarly discourse has a broad range of views on this topic, with some scholars arguing that LLMs do approximate human cognition, possess meaning, and even exhibit intent and planning capacities.

Steven T. Piantadosi, professor of psychology and neuroscience at UC Berkeley, along with Felix Hill, a research scientist at Deep Mind contend that “LLMs . . . likely capture important aspects of meaning,” because “a model which captures how sentences relate to each other might indeed capture how thoughts relate to each other.” In their view, “such relationships between concepts are *the* essential, defining, aspects of meaning.”[^piantadosi-hill] (Emphasis original.)

Addressing the high level of abstraction and inherently low-bandwidth of language, their analysis draws a parallel with geometry. They propose that, akin to decoding information about high-dimensional states from low-dimensional geometric projections, text could be seen as a low-dimensional projection of the usage patterns of concepts, and that “it is plausible that some properties of the real meaning could be inferred from text.”[^p-h-2]

The cautious phrasing (‘plausible,’ ‘some,’ ‘could’) might reflect an acknowledgement of underlying complexities that are not explored within the work. From a lay perspective, these might include that compared to geometric projections, language descriptions are inherently imprecise and commonly incorrect; and that unlike the domain-consistent transformations in geometry, language attempts to capture non-verbal concepts, a task likened to “writing about music is like dancing about architecture.”

Considering the premise of their argument, where meaning is defined as the intricate web of relationships between words as decoded by LLMs in embeddings and deeper layers, it is apparent how this can be a useful way to describe the capabilities of LLMs to infer meaning from text and mirror aspects of human cognition.

### Toward Deeper Understanding

The diverse viewpoints represented in this first section reflect a broad range of perspectives on LLMs’ potential and limitations. Although many differences arise from varying definitions and there is a consensus on LLMs’ efficacy, significant disagreements remain on the nature of intelligence, language processing, and the progress available from evolution of LLMs or alternative approaches.[^contrast]  

The discussion about LLMs’ characteristics touches models of language and thought representation, inviting a deeper examination into the concept of meaning. As promised in the introduction, insights from this exploration should further enrich our ability to leverage LLMs’ strengths, mitigate their shortcomings, and orient us as we witness future advances.


>> This article will continue with part 2, **The Finger Pointing to the Moon**, examining how the relationship of symbols and meaning play role in LLMs capabilities, with emphasis on practical strengths and mitigations as seen through this lens; and conclude with a look at how the success of LLMs affects the paths towards machines with human-level performance.
>> {: .small}

[^atg]: This is a human-produced text that includes manually adapted recommendations generated by ChatGPT&nbsp;4 on structure, fluency, and vocabulary. [Details](https://authograph.com/view?r=ZQvxiBShAa "Authograph record")
[^brooker]: Phillip Brooker, William Dutton, and Michael Mair, “[The New Ghosts in the Machine: ‘Pragmatist’ AI and the Conceptual Perils of Anthropomorphic Description](https://livrepository.liverpool.ac.uk/3057133/),” *Ethnographic Studies* 16 (2019): 273
[^browning-lecun]: Jacob Browning and Yann LeCun, “[AI and the Limits of Language](https://www.noemamag.com/ai-and-the-limits-of-language/),” *Noema Magazine*, August 23, 2022, https://www.noemamag.com/ai-and-the-limits-of-language/.
[^b-l]: Browning and LeCun, “AI and the Limits of Language.”
[^lecun]: Yann LeCun, “[Objective-Driven AI: Towards Machines that can Learn, Reason, and Plan](https://www.youtube.com/watch?v=d_bdU3LsLzE),” lecture, The Dean W. Lytle Endowed Lecture Series, University of Washington Department of Electrical & Computer Engineering, HUB Lyceum, January 24, 2024.
[^l-2]: LeCun, “Objective-Driven AI.”
[^boinodiris]: Phaedra Boinodiris, “[Risks of Large Language Models (LLM)](https://www.youtube.com/watch?v=r4kButlDLUc),” YouTube video, presented by IBM Technology. Posted April 14, 2023. https://www.youtube.com/watch?v=r4kButlDLUc.
[^bender-gebru]: Emily M. Bender, Timnit Gebru, Angelina McMillan-Major, and Shmargaret Shmitchell, “[On the dangers of stochastic parrots: Can language models be too big?🦜](https://dl.acm.org/doi/abs/10.1145/3442188.3445922),” in *Proceedings of the 2021 ACM conference on fairness, accountability, and transparency* (2021): 615.
[^parrot]: The paper discusses ongoing concerns about the risks of replicating bias in training data, environmental cost, and the ethical considerations of AI research. Its release led to significant discussions within Google, resulting in the departure of Timnit Gebru and Margaret Mitchell from the company.
[^b-g-2]: Bender, Gebru et al., “Stochastic Parrots,” 616.
[^turochamp]: For details on Alan Turing and David Champernowne’s  1948 *Turochamp*, see Garry Kasparov and Frederic Friedel, “[Reconstructing Turing’s ‘paper machine’](https://easychair.org/publications/preprint_download/WjKW),” EasyChair Preprint no. 3 (2017).
[^turing]: Alan Turing, “Intelligent Machinery,” in *Collected Works of A.M. Turing: Mechanical Intelligence*, ed. D.C. Ince (Amsterdam: North-Holland, 1992), 109.
[^l-3]: LeCun, “Objective-Driven AI.”
[^alphazero]: David Silver et al., "A General Reinforcement Learning Algorithm That Masters Chess, Shogi, and Go through Self-Play," *Science* 362, no. 6419 (2018): 1140-1144.
[^open]: While AlphaZero employs a distinct architecture and training approach in a closed domain, the emphasis is on the level of ‘understanding’ it exhibits and reduced inclination to anthropomorphize machines in non-verbal contexts.
[^piantadosi-hill]: Steven T. Piantadosi and Felix Hill, “[Meaning without reference in large language models](https://arxiv.org/abs/2208.02957v2),” arXiv preprint arXiv:2208.02957 (2022): 1, 4–5.
[^p-h-2]:  Piantadosi and Hill, discussing findings from N. H. Packard et al., “Geometry from a Time Series,” *Physical Review Letters* 45, no. 9 (1980): 712, 4–5.
[^contrast]: Piantadosi and Hill’s see “many places where these models _can still be_ improved,” (emphasis added) and predict that “as these improvements are made, the models will come into closer alignment with humans, and [they] will enrich the model’s sense of meaning.” (pp. 3–4) This narrative contrasts with e.g. LeCun’s perspective that emphasize areas where LLMs fail entirely and disputes their ability of continued advancement.