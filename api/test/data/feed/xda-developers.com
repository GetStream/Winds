<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
	xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
	>

<channel>
	<title>XDA Android &#8211; xda-developers</title>
	<atom:link href="https://www.xda-developers.com/category/android/feed/" rel="self" type="application/rss+xml" />
	<link>https://www.xda-developers.com</link>
	<description>Android and Windows Phone Development Community</description>
	<lastBuildDate>Mon, 02 Jul 2018 15:35:15 +0000</lastBuildDate>
	<language>en-US</language>
	<sy:updatePeriod>hourly</sy:updatePeriod>
	<sy:updateFrequency>1</sy:updateFrequency>
	<generator>https://wordpress.org/?v=4.9.6</generator>
	<item>
		<title>How to immediately get OxygenOS updates for the OnePlus 6/5T/5/3T/3</title>
		<link>https://www.xda-developers.com/get-oxygenos-update-oneplus-6-oneplus-5t-oneplus-5-oneplus-3t-oneplus-3/</link>
		<comments>https://www.xda-developers.com/get-oxygenos-update-oneplus-6-oneplus-5t-oneplus-5-oneplus-3t-oneplus-3/#respond</comments>
		<pubDate>Sun, 01 Jul 2018 03:00:33 +0000</pubDate>
		<dc:creator><![CDATA[Arol Wright]]></dc:creator>
				<category><![CDATA[Featured]]></category>
		<category><![CDATA[Full XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[Tutorials]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[android security update]]></category>
		<category><![CDATA[android security updates]]></category>
		<category><![CDATA[Android Updates]]></category>
		<category><![CDATA[How to]]></category>
		<category><![CDATA[OnePlus 3]]></category>
		<category><![CDATA[OnePlus 3T]]></category>
		<category><![CDATA[OnePlus 3T colette edition]]></category>
		<category><![CDATA[OnePlus 3T Midnight Edition]]></category>
		<category><![CDATA[OnePlus 5]]></category>
		<category><![CDATA[oneplus 5t]]></category>
		<category><![CDATA[oneplus 5t star wars limited edition]]></category>
		<category><![CDATA[OnePlus 6]]></category>
		<category><![CDATA[OTA Update]]></category>
		<category><![CDATA[OxygenOS]]></category>
		<category><![CDATA[soft gold oneplus 3]]></category>
		<category><![CDATA[Software update]]></category>
		<category><![CDATA[software updates]]></category>
		<category><![CDATA[tutorial]]></category>
		<category><![CDATA[Update]]></category>
		<category><![CDATA[updates]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=221966</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/oxygenos-logo-feature-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="OxygenOS Open Beta for the OnePlus 5 and OnePlus 5T" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />One of the most annoying parts of over-the-air (OTA) updates is waiting for the update to be delivered on your device. This varies wildly from device to device, and many factors take part while checking if you&#8217;re eligible: your carrier, your OEM, your current Android version, and your actual geographical location/IP, just to name a]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/oxygenos-logo-feature-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="OxygenOS Open Beta for the OnePlus 5 and OnePlus 5T" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">One of the most annoying parts of over-the-air (OTA) updates is waiting for the update to be delivered on your device. This varies wildly from device to device, and many factors take part while checking if you&#8217;re eligible: your carrier, your OEM, your current Android version, and your actual geographical location/IP, just to name a few. It&#8217;s particularly annoying when your OEM doesn&#8217;t officially support your country. If you want to skip the wait and immediately get <a href="https://www.xda-developers.com/tag/oxygenos/">OxygenOS</a> updates on your <a href="https://goo.gl/oSh4G9">OnePlus 6</a>, <a href="https://forum.xda-developers.com/oneplus-5t">OnePlus 5T</a>, <a href="https://forum.xda-developers.com/oneplus-5">OnePlus 5</a>, <a href="https://forum.xda-developers.com/oneplus-3t">OnePlus 3T</a>, or <a href="https://forum.xda-developers.com/oneplus-3">OnePlus 3</a>, then you can use the free Oxygen Updater app to do so.</p>
<h2>Skipping the line with Oxygen Updater</h2>
<p>I live in Caracas, Venezuela, and I currently use a OnePlus 5T as my daily driver. OnePlus doesn&#8217;t officially sell their phones in Venezuela—I had to import mine from the U.S. store and have it shipped to me via a third-party, so OxygenOS updates are sometimes delayed by quite a bit here. I often download update packages with my browser, either from the official OnePlus download section or XDA threads, in order to update my device and then proceed to install it with either <a href="https://www.xda-developers.com/how-to-install-twrp/">TWRP</a> or the Oxygen Recovery.</p>
<p>It&#8217;s even worse for other devices made by other manufacturers. Just to cite an example, update rollouts for LG can often take months to roll out from one country to the other. This is pretty common practice in the Android ecosystem. It&#8217;s pretty rare to find a phone that actually receives timely security patches, without counting the <a href="https://forum.xda-developers.com/pixel">Google Pixel</a> phones. OnePlus used to be pretty slow when keeping their phones up to date, but they have picked up the pace recently, especially when it comes to security patches. But actual OTA rollouts still take a while to reach everyone. There&#8217;s a good reason for that, though, and it&#8217;s to ensure that bugs are caught early before the update reaches everyone.</p>
<p>If you don&#8217;t want to wait for an update, you can use a VPN to connect to OnePlus&#8217; usual test markets: Germany or Canada. This is exactly what the Oxygen Updater app does for you. Oxygen Updater is a pretty nifty tool that, despite what the name would tell you, is not made by OnePlus or anyone closely related to the company. It&#8217;s instead an unofficial tool which focuses on OnePlus devices like the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3. The concept is pretty simple: you select your device and the app checks whether an update is available.</p>

<a href='https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182328.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-1"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182328-512x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="How to get OxygenOS updates on the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182328-512x1024.jpg 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182328-150x300.jpg 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182328.jpg 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182332.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-1"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182332-512x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="How to get OxygenOS updates on the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182332-512x1024.jpg 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182332-150x300.jpg 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182332.jpg 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182338.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-1"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182338-512x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="How to get OxygenOS updates on the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182338-512x1024.jpg 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182338-150x300.jpg 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182338.jpg 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>

<p>Oxygen Updater grabs update packages for all currently supported OnePlus devices, including the OnePlus 6, the OnePlus 5/OnePlus 5T, and the OnePlus 3/OnePlus 3T, in both OxygenOS stable and Open Beta channels. It also gives you the option to download partial OTA packages (if you&#8217;re unrooted) and full firmware ZIPs, both of which you can install through your recovery of choice. Furthermore, it skips over OnePlus&#8217; OTA rollouts: if an update exists for your device, you&#8217;ll be able to download said update right away, even if the Update section in your phone says your device is up to date.</p>

<a href='https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182348.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-2"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182348-512x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="How to get OxygenOS updates on the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182348-512x1024.jpg 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182348-150x300.jpg 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182348.jpg 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182357.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-2"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182357-512x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="How to get OxygenOS updates on the OnePlus 6, OnePlus 5T, OnePlus 5, OnePlus 3T, and OnePlus 3" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182357-512x1024.jpg 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182357-150x300.jpg 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180623-182357.jpg 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>

<h2>How to get OxygenOS updates on the OnePlus 6/5T/5/3T/3</h2>
<p>For all intents and purposes, it&#8217;s just as feature rich as the OxygenOS update manager. Maybe even better. It&#8217;s pretty simple to use, actually:</p>
<ol>
<li>Download Oxygen Updater from the Google Play Store using the button below.</li>
<li>Start the app. It&#8217;ll start on the setup screen, where the app will be configured for your device.</li>
<li>Note that the app may check for root access and ask for root permissions. If applicable, then grant it, since it will simply default the update method to &#8220;full update&#8221; instead of partial update otherwise.</li>
<li>Follow through the setup until you get to the main screen. If it says your device is up to date, then congrats!</li>
<li>If it says an update is available, download it and the update will begin downloading in the background.</li>
<li>After it&#8217;s finished, just tap on the notification. The app will follow through the normal update cycle: it&#8217;ll reboot, boot into recovery mode, install, then reboot again.</li>
</ol>
<p>I found it to be a pretty reliable tool during my own testing. I bumped my OnePlus 5T from Open Beta 8 straight to <a href="https://www.xda-developers.com/oxygenos-open-beta-12-10-oneplus-5-5t/">Open Beta 10</a> in a breeze. As we said before, it&#8217;s also compatible with all devices currently supported by OnePlus, so it&#8217;s definitely something worth checking out if you&#8217;re a OnePlus user. You can download and give Oxygen Updater a shot yourself for free from Google Play.</p>
<!-- WP-Appbox (Version: 4.0.53 // Store: googleplay // ID: com.arjanvlek.oxygenupdater) --><p><a target="_blank" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.arjanvlek.oxygenupdater" title="Oxygen Updater">Oxygen Updater (Free<sup>+</sup>, Google Play) →</a></p><!-- /WP-Appbox -->
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/get-oxygenos-update-oneplus-6-oneplus-5t-oneplus-5-oneplus-3t-oneplus-3/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>How EAS helps make the Google Pixel the fastest Android phone</title>
		<link>https://www.xda-developers.com/google-pixel-fastest-android-phone-eas/</link>
		<comments>https://www.xda-developers.com/google-pixel-fastest-android-phone-eas/#respond</comments>
		<pubDate>Sat, 30 Jun 2018 14:55:01 +0000</pubDate>
		<dc:creator><![CDATA[Adam Conway]]></dc:creator>
				<category><![CDATA[Developments]]></category>
		<category><![CDATA[Featured]]></category>
		<category><![CDATA[Full XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[benchmark]]></category>
		<category><![CDATA[benchmarks]]></category>
		<category><![CDATA[custom kernel]]></category>
		<category><![CDATA[Custom ROM]]></category>
		<category><![CDATA[custom ROMs]]></category>
		<category><![CDATA[customROM]]></category>
		<category><![CDATA[energy aware scheduling]]></category>
		<category><![CDATA[Google Pixel]]></category>
		<category><![CDATA[Google Pixel 2]]></category>
		<category><![CDATA[google Pixel 2 XL]]></category>
		<category><![CDATA[Google Pixel XL]]></category>
		<category><![CDATA[Kernel]]></category>
		<category><![CDATA[Linux]]></category>
		<category><![CDATA[OnePlus 3]]></category>
		<category><![CDATA[OnePlus 6]]></category>
		<category><![CDATA[performance]]></category>
		<category><![CDATA[Qualcomm Snapdragon 820]]></category>
		<category><![CDATA[Qualcomm Snapdragon 821]]></category>
		<category><![CDATA[qualcomm snapdragon 845]]></category>
		<category><![CDATA[ROM]]></category>
		<category><![CDATA[ROMs]]></category>
		<category><![CDATA[snapdragon 820]]></category>
		<category><![CDATA[snapdragon 821]]></category>
		<category><![CDATA[speed]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=185480</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/Linux-Tux-Feature-Image-XDA-Orange-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="Linux Kernel Energy Aware Scheduling" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Far back in the past when Linux was just an idea in the mind of Linus Torvalds, CPUs were single-core entities which required an immense amount of energy for little power. The first ever commercially available processor, the Intel 4004, ran at a clock-rate of 740kHz on a single core. Back then, there was no need]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/Linux-Tux-Feature-Image-XDA-Orange-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="Linux Kernel Energy Aware Scheduling" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Far back in the past when Linux was just an idea in the mind of Linus Torvalds, CPUs were single-core entities which required an immense amount of energy for little power. The first ever commercially available processor, the Intel 4004, ran at a clock-rate of 740kHz on a single core. Back then, there was no need for a load scheduler. Load scheduling was reserved for the dual-core &#8220;behemoths&#8221; such as the IBM Power 4 which came out some decades after. These ran at a beastly 1.1GHz to 1.9GHz and required programs and the system to utilize these cores correctly. How did we get from these machines to software algorithms that make use of multiple cores? You may have heard of Energy Aware Scheduling (EAS) on our forums before. It&#8217;s part of the reason why the <a href="https://forum.xda-developers.com/pixel">Google Pixel</a> smartphones perform so well. What&#8217;s so great about EAS and how did we even get to this point? Before we can explain that, we need to talk about Linux load schedulers.</p>
<hr />
<h2>The Evolution of the Linux Load Schedulers</h2>
<h3>Round-Robin Scheduling</h3>
<div id="attachment_185558" style="width: 410px" class="wp-caption alignright"><img class="wp-image-185558" src="https://www1-lw.xda-cdn.com/files/2017/08/RoundRobin-198x300.jpg" alt="" width="400" height="607" srcset="https://www1-lw.xda-cdn.com/files/2017/08/RoundRobin-198x300.jpg 198w, https://www1-lw.xda-cdn.com/files/2017/08/RoundRobin-768x1165.jpg 768w, https://www1-lw.xda-cdn.com/files/2017/08/RoundRobin-675x1024.jpg 675w, https://www1-lw.xda-cdn.com/files/2017/08/RoundRobin.jpg 791w" sizes="(max-width: 400px) 100vw, 400px" /><p class="wp-caption-text">Round Robin Processing. Source: Wikipedia</p></div>
<p>Round robin processing is a simple concept to explain and understand, and an even simpler one to grasp its disadvantages. Round-robin uses time slicing to allocate time to each process. Let&#8217;s assume we have four processes running on our computer.</p>
<ul>
<li>Process A</li>
<li>Process B</li>
<li>Process C</li>
<li>Process D</li>
</ul>
<p>Now, let&#8217;s do the job of the round-robin scheduler. We will allocate 100 milliseconds (time-slicing) to each process before moving on to the next. This means Process A can take 100 milliseconds to do its processing, then it moves to Process B and so on. If an application&#8217;s job takes 250 milliseconds to do, it will need to go through this process 3 times just to finish its work! Now scale this across different cores, so that Process A and Process B are allocated to core 1, and Process C and Process D are allocated to core 2. This was replaced by O(n) scheduling (which was like round-robin, but using epochs and allowing dynamic allocation of time), then O(1) scheduling (minimized overhead, unlimited process support), then finally the Completely Fair Scheduler (CFS). CFS was merged into the Linux kernel version 2.6.23 in October 2007. It has been overhauled since and is still the default scheduler in Linux systems.</p>
<h3>Completely Fair Scheduler</h3>
<p>The Completely Fair Scheduler has existed in Android since its inception and is used on non-big.LITTLE devices. It uses an intelligent algorithm to determine processing order, time allocated etc. It is an example of a working implementation of the well-studied scheduling algorithm called &#8220;weighted fair queueing.&#8221; This basically focuses on providing priority to system processes and other high priority processes running on the machine. If it were to run on a big.LITTLE device, all cores would be perceived as equal. This is bad, as low power cores may be forced to run intensive applications, or even worse, the opposite may occur. The decoding for listening to music may be done on the big core, for example, increasing power consumption needlessly. This is why we need a new scheduler for big.LITTLE, one which can actually recognise and utilise the difference in cores in a power efficient manner. That&#8217;s where Heterogeneous Multi-Processing (HMP) comes in, the standard load scheduler most Android phones are running now.</p>
<h3>Heterogeneous Multi-Processing</h3>
<p>This is the standard load scheduler for any big.LITTLE device released in recent years, other than the Google Pixel. HMP makes use of the big.LITTLE architecture, delegating low priority, less intensive work to the little cores which consume less power. HMP is &#8220;safe&#8221; wherein it knows what should go to the big cores and what should go to the little cores, without making mistakes. It just works and requires a lot less effort to set up on the development side than something like EAS, which we&#8217;ll get into in a moment. HMP is just an extension of CFS to make it power aware.</p>
<p>HMP doesn&#8217;t take guesses, nor does it predict future processes. This is good but is why the device cannot be as fluid as those running EAS and is also why it consumes slightly more battery. This, finally, brings us to Energy Aware Scheduling (EAS), which I firmly believe is the future in ROM and kernel development as more OEMs adopt it.</p>
<h3>Energy Aware Scheduling</h3>
<p>Energy Aware Scheduling (EAS) is the next big thing that users on our forums are talking about. If you use a <a href="https://forum.xda-developers.com/oneplus-3">OnePlus 3</a> (or a Google Pixel, obviously) you&#8217;ve definitely heard about it in the forums. It launched into the mainstream with the Qualcomm <a href="https://www.xda-developers.com/tag/qualcomm-snapdragon-845/">Snapdragon 845</a>, so if you have one of these devices you already have an EAS-enabled smartphone. EAS in the form of kernels such as <a href="https://forum.xda-developers.com/oneplus-3/oneplus-3--3t-cross-device-development/renderzenith-op3-t3803706">RenderZenith</a> and ROMs such as <a href="https://forum.xda-developers.com/oneplus-3/oneplus-3--3t-cross-device-development/rom-kernel-vertexos-blazar-zenith-kernel-t3571781">VertexOS</a> and <a href="https://forum.xda-developers.com/oneplus-3/oneplus-3--3t-cross-device-development/rom-pure-fusion-os-t3654996">PureFusion</a> were taking the OnePlus 3 forums by storm in its prime. Of course, the Google Pixel also comes with EAS. With the promises of improved battery life and better performance, what&#8217;s the catch?</p>
<p>Energy Aware Scheduling is not as simple as it is not universal to every device like CFS or HMP. EAS requires an understanding of the processor it is running on, based off of an energy model. These energy models are made by teams of engineers constantly testing and working to give an optimal performance. As the <a href="https://www.xda-developers.com/tag/qualcomm-snapdragon-820/">Snapdragon 820</a> and 821 are basically the same, custom kernels on the OnePlus 3 uses the Google Pixel energy model. Devices with the Snapdragon 845 can utilise EAS, and the <a href="https://goo.gl/oSh4G9">OnePlus 6</a> does to some degree. It&#8217;s not as tuned as a Google Pixel device would be, but it gets the job done. Here&#8217;s an example of how, despite the OnePlus 6 having a better processor with EAS, the <a href="https://forum.xda-developers.com/pixel-2-xl">Pixel 2 XL</a> still beats it in smoothness. Both of these images were taken from our <a href="https://www.xda-developers.com/oneplus-6-speed-gaming-review/">speed-oriented review</a> of the OnePlus 6.</p>

<a href='https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-3"><img width="900" height="600" src="https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1-1024x683.png" class="attachment-large size-large rl-gallery-link"  alt="" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1-1024x683.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1-300x200.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1-768x512.png 768w, https://www1-lw.xda-cdn.com/files/2018/06/Pixel-2-XL_scrolling_PlayStore_round2-1.png 1200w" sizes="(max-width: 900px) 100vw, 900px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-3"><img width="900" height="600" src="https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1-1024x683.png" class="attachment-large size-large rl-gallery-link"  alt="" srcset="https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1-1024x683.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1-300x200.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1-768x512.png 768w, https://www1-lw.xda-cdn.com/files/2018/06/ONEPLUS-A6003_scrolling_PlayStore_round2-1.png 1200w" sizes="(max-width: 900px) 100vw, 900px" /></a>

<p>If you have trouble understanding the graphs, you can take a look at the image below for guidance. Anything exceeding the green line indicates dropped frames and, in the worst cases, noticeable stuttering.</p>
<p><img class="aligncenter size-large wp-image-220571" src="https://www1-lw.xda-cdn.com/files/2018/06/gpu-profiling-1024x357-1024x357.png" alt="" width="900" height="314" srcset="https://www1-lw.xda-cdn.com/files/2018/06/gpu-profiling-1024x357.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/gpu-profiling-1024x357-300x105.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/gpu-profiling-1024x357-768x268.png 768w" sizes="(max-width: 900px) 100vw, 900px" /></p>
<p>The OnePlus 6 implementation of EAS is interesting, as it doesn&#8217;t appear to be a fully-fledged implementation like you&#8217;d find on a Google Pixel with the same SoC. The scheduler tunables don&#8217;t make much sense either, so that probably explains why it&#8217;s not as performance efficient as you&#8217;d expect. It&#8217;s extremely conservative in power consumption, with the system prioritising the low power cores for the majority of the work.</p>
<p>Tunables are simply a set of parameters that are passed to the CPU governor, which changes how the governor reacts to certain situations in terms of frequency. The scheduler then decides where it places tasks on different processors. The OnePlus 6&#8217;s tunables are set to prioritise work on low-powered cores. It also doesn&#8217;t help that the Google Pixel 2 has a huge amount of input boost, keeping all 8 cores online all the time. Google also uses an <a href="https://source.android.com/devices/tech/debug/jank_jitter#interrupt">interrupt balancer</a> which helps to remove frame drops and improve performance.</p>
<p>So how does EAS work? Why is it so efficient only in certain conditions?</p>
<p>Energy Aware Scheduling introduces the need to use an energy model, and as mentioned above requires a lot of testing and work to make it perfect. EAS attempts to unify three different core parts of the kernel which all act independently, and the energy model helps to unify them.</p>
<ul>
<li>Linux scheduler (CFS, mentioned above)</li>
<li>Linux cpuidle</li>
<li>Linux cpufreq</li>
</ul>
<p>Unifying all 3 parts under the scheduler and calculating them together gives a potential for energy saving, as calculating them together allows them to be as efficient as possible. CPUIdle tries to decide when the CPU should go into an idle mode, while CPUFreq tries to decide when to ramp up or down the CPU. Both of these modules have the primary goal of saving energy. Not only that, it then categorizes processes into four cgroups, being top-app, system-background, foreground, and background. Tasks due to be processed are placed into one of these categories, and then the category is given CPU power and the work is delegated over different CPU cores. top-app is the highest priority of completion, followed by foreground, background, and then system-background. Background technically has the same priority as system-background, but system-background usually also has access to more little cores. In effect, Energy Aware Scheduling is taking core parts of the Linux kernel and unifying it all into one process.</p>
<p>When waking the device, EAS will choose the core in the shallowest idle state, minimising the energy needed to wake the device. This helps to reduce the required power in using the device, as it will not wake up the large cluster if it doesn&#8217;t need to. Load tracking is also an extremely crucial part of EAS, and there are two options. &#8220;Per-Entity Load Tracking&#8221; (PELT) is usually used for load tracking, the information is then used to decide frequencies and how to delegate tasks across the CPU. &#8220;Window-Assisted Load Tracking&#8221; (WALT) can also be used and is what&#8217;s used on the Google Pixel. Many EAS ROMs on our forums, such as VertexOS, opt to use WALT. Many ROMs will release two versions of the kernel with WALT or PELT, so it&#8217;s up to the user to decide. WALT is more bursty, with high peaks in CPU frequency while PELT tries to remain more consistent. The load tracker doesn&#8217;t actually affect the CPU frequency, it just tells the system what the CPU usage is at. A higher CPU usage requires a higher frequency and so a consistent trait of PELT is that it causes the CPU frequency to ramp up or down slowly. PELT does tend to stray towards higher CPU load reporting, so it may provide higher performance at a higher battery cost. Nobody can really say at this point in time which load tracking system is better, however, as both load tracking methods are getting continually patched and refined.</p>
<p>Either way, it&#8217;s obvious that, regardless of the load tracking method used, there is an increase in efficiency. Rather than just processing tasks on any processor, the task is analyzed and the amount of energy required to run it is estimated. This clever task placement means that tasks get completed in a much more efficient manner while also making the system quicker as a whole. EAS is all about getting the smoothest UI possible with minimal power usage. This is where other external components such as schedtune come into play.</p>
<p>Schedtune is defined in each cgroup by two tunables which ensure finer control over the tasks to be completed. It doesn&#8217;t just control the spread out of tasks over multiple CPUs, but also if the perceived load should be inflated in order to ensure time-sensitive tasks are completed quicker. This way, foreground applications and services that the user is availing of won&#8217;t slow down and cause unnecessary performance issues.</p>
<p>While Energy Aware Scheduling is the next big thing, it can also be argued it&#8217;s already here and has been for a while. With more and more devices hitting the mainstream with Energy Aware Scheduling, a new age of mobile processing efficiency is here.</p>
<h2>The Pros and Cons of Round-Robin, CFS, HMP and EAS</h2>
<p>While my graphics skills are sub-par, I have thrown together an image which should summarize what the pros and cons of each of these schedulers are.</p>
<p><img class="aligncenter wp-image-221158 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/schedulers-1024x683.png" alt="" width="900" height="600" srcset="https://www1-lw.xda-cdn.com/files/2018/06/schedulers-1024x683.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/schedulers-300x200.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/schedulers-768x512.png 768w, https://www1-lw.xda-cdn.com/files/2018/06/schedulers.png 1200w" sizes="(max-width: 900px) 100vw, 900px" /></p>
<hr />
<p><em>I would like to extend a special thank you to XDA Recognised Contributor <a href="https://forum.xda-developers.com/member.php?u=5060769">Mostafa Wael</a> whose explanations of various aspects of EAS greatly helped in making this article possible. I would also like to thank XDA Recognised Developer<a href="https://forum.xda-developers.com/member.php?u=6745491"> joshuous</a>, XDA Recognised Developer <a href="https://forum.xda-developers.com/member.php?u=5438598">RenderBroken</a> and <a href="https://forum.xda-developers.com/u11/development/kernel-kirisakura-eas-0-7-energy-aware-t3647471/post73189268">Mostafa Wael for his write up on EAS</a>. For those of you who found interest in EAS-related parts, Linaro has a lot of documentation on EAS which you can read.</em></p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/google-pixel-fastest-android-phone-eas/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>How to enable YouTube Dark Mode on Android right now (Root)</title>
		<link>https://www.xda-developers.com/enable-youtube-dark-mode-android/</link>
		<comments>https://www.xda-developers.com/enable-youtube-dark-mode-android/#respond</comments>
		<pubDate>Fri, 29 Jun 2018 17:46:56 +0000</pubDate>
		<dc:creator><![CDATA[Joe Fedewa]]></dc:creator>
				<category><![CDATA[Mini XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[Tutorials]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[Dark Mode]]></category>
		<category><![CDATA[dark theme]]></category>
		<category><![CDATA[How to]]></category>
		<category><![CDATA[tutorial]]></category>
		<category><![CDATA[Youtube]]></category>
		<category><![CDATA[YouTube for Android]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=211746</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/youtube-dark-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Google recently added a Dark Mode to the YouTube mobile app (following Dark Mode for the desktop website), but there&#8217;s just one problem: iOS users get it first. Dark Mode is still &#8220;coming soon&#8221; to Android and we&#8217;re not exactly sure how long it will take. The good news is the Android developer community has once]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/youtube-dark-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Google recently <a href="https://www.xda-developers.com/youtube-app-dark-mode-android/">added a Dark Mode to the YouTube mobile app</a> (following Dark Mode for the desktop website), but there&#8217;s just one problem: iOS users get it first. Dark Mode is still &#8220;coming soon&#8221; to Android and we&#8217;re not exactly sure how long it will take. The good news is the Android developer community has once again come through for us. If you have root access on your Android device, you can get Dark Mode in the app right now.</p>
<div class="alert_message yellow" style="margin-bottom: 5px"><p><strong>Update 6/29/18</strong>: It has been over 3 months since this article was originally published and the dark theme is still not officially available for Android users. However, the flag to enable dark theme has changed so we have updated this article.</p></div>

<a href='https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134247_506.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-4"><img width="576" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134247_506-576x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="youtube dark mode" srcset="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134247_506-576x1024.jpg 576w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134247_506-169x300.jpg 169w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134247_506.jpg 675w" sizes="(max-width: 576px) 100vw, 576px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134249_686.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-4"><img width="576" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134249_686-576x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="youtube dark mode" srcset="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134249_686-576x1024.jpg 576w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134249_686-169x300.jpg 169w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134249_686.jpg 675w" sizes="(max-width: 576px) 100vw, 576px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134235_205.jpg' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-4"><img width="576" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134235_205-576x1024.jpg" class="attachment-large size-large rl-gallery-link"  alt="youtube dark mode" srcset="https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134235_205-576x1024.jpg 576w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134235_205-169x300.jpg 169w, https://www1-lw.xda-cdn.com/files/2018/03/IMG_20180313_134235_205.jpg 675w" sizes="(max-width: 576px) 100vw, 576px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-4.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-4"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-4-512x1024.png" class="attachment-large size-large rl-gallery-link"  alt="YouTube Dark Theme on Android" srcset="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-4-512x1024.png 512w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-4-150x300.png 150w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-4.png 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-5.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-4"><img width="512" height="1024" src="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-5-512x1024.png" class="attachment-large size-large rl-gallery-link"  alt="YouTube Dark Theme on Android" srcset="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-5-512x1024.png 512w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-5-150x300.png 150w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-5.png 600w" sizes="(max-width: 512px) 100vw, 512px" /></a>

<p>This method requires modifying a value in the shared preferences folder in the app&#8217;s data folder. That&#8217;s why root access is necessary. If your device is not already rooted, <a href="https://forum.xda-developers.com/top">check out your device&#8217;s forums</a> for instructions. Once you have root access, you will need the Preferences Manager app and, of course, YouTube.</p>
<p>Here&#8217;s how to do it:</p>
<!-- WP-Appbox (Version: 4.0.53 // Store: googleplay // ID: fr.simon.marquis.preferencesmanager) --><p><a target="_blank" rel="nofollow" href="https://play.google.com/store/apps/details?id=fr.simon.marquis.preferencesmanager" title="Preferences Manager">Preferences Manager (Free, Google Play) →</a></p><!-- /WP-Appbox -->
<ol>
<li>Install Preferences Manager from the Google Play Store.</li>
<li>Find <strong>YouTube</strong> in the list. (If it doesn&#8217;t show up, you may need to enable &#8220;show system apps&#8221; in the menu.)</li>
<li>Tap it to open its preferences files.</li>
<li>You should be on <strong>youtube.xml</strong>. If not, swipe left/right until you are.</li>
<li>Search for <strong>dark</strong></li>
<li>Change both values from <strong>false</strong> to <strong>true. </strong>
<ul>
<li>If you don&#8217;t see the values, add them manually (<strong>app_theme_dark_developer</strong> and <strong>app_dark_theme</strong>) and set them to <strong><strong>true</strong></strong>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-5"><img width="300" height="226" src="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2-300x226.png" class="attachment-medium size-medium rl-gallery-link"  alt="YouTube Dark Theme" srcset="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2-300x226.png 300w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2-768x578.png 768w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2-1024x771.png 1024w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-2.png 1200w" sizes="(max-width: 300px) 100vw, 300px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-5"><img width="300" height="234" src="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3-300x234.png" class="attachment-medium size-medium rl-gallery-link"  alt="YouTube Dark Theme" srcset="https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3-300x234.png 300w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3-768x598.png 768w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3-1024x798.png 1024w, https://www1-lw.xda-cdn.com/files/2018/03/YouTube-Dark-Theme-on-Android-3.png 1200w" sizes="(max-width: 300px) 100vw, 300px" /></a>
</li>
</ul>
</li>
<li>Save the changes.</li>
<li>Force close YouTube.</li>
</ol>
<p>When you open up the app again it should be in Dark Mode. The app will have a nice dark gray background and white-on-black icons. You can scroll through videos without the blinding white interface. Thanks to XDA member <a href="https://forum.xda-developers.com/member.php?u=4648515">AL_IRAQI</a> for sending in this method and providing screenshots.</p>
<!-- WP-Appbox (Version: 4.0.53 // Store: googleplay // ID: com.google.android.youtube) --><p><a target="_blank" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.google.android.youtube" title="YouTube">YouTube (Free, Google Play) →</a></p><!-- /WP-Appbox -->
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/enable-youtube-dark-mode-android/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>Honor 10 Mini-Review: Two Months Later</title>
		<link>https://www.xda-developers.com/honor-10-mini-review-two-months-later/</link>
		<pubDate>Thu, 28 Jun 2018 15:00:26 +0000</pubDate>
		<dc:creator><![CDATA[Ronald Comstock]]></dc:creator>
				<category><![CDATA[Featured]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[XDA Mini Reviews]]></category>
		<category><![CDATA[device review]]></category>
		<category><![CDATA[Honor]]></category>
		<category><![CDATA[Honor 10]]></category>
		<category><![CDATA[XDA Device Review]]></category>
		<category><![CDATA[XDA Review]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=218537</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/IMG_2811-150x150.jpg" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />When Honor launched the Honor 10, they promised a phone that would provide a new AI experience. Bringing the AI technology from the Honor View 10, and the build quality and performance of the Honor 9, we got a polished and complete version of Honor&#8217;s vision for their smartphones. Honor 10 Specs Chipset Kirin 970]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/IMG_2811-150x150.jpg" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p>When Honor launched the <a href="https://forum.xda-developers.com/honor-10" title="">Honor 10</a>, they promised a phone that would provide a new AI experience. Bringing the AI technology from the <a href="https://forum.xda-developers.com/honor-view-10" title="">Honor View 10</a>, and the build quality and performance of the <a href="https://forum.xda-developers.com/honor-9" title="">Honor 9</a>, we got a polished and complete version of Honor&#8217;s vision for their smartphones.</p>
<blockquote><p><span>&ldquo;</span>Introducing #Honor10 with #BeautyInAI. Our incredibly beautiful phone with independent NPU to provide the best AI experience and smart photography.<span>&rdquo;</span></p><footer>@Honorglobal</footer></blockquote>
<table class="table_none">
<thead>
<tr>
<th>Honor 10</th>
<th>Specs</th>
</tr>
</thead>
<tbody>
<tr>
<td>Chipset</td>
<td>Kirin 970</td>
</tr>
<tr>
<td>Display</td>
<td>1080&#215;2280</td>
</tr>
<tr>
<td>RAM</td>
<td>4/6GB</td>
</tr>
<tr>
<td>Storage</td>
<td>64/128GB</td>
</tr>
<tr>
<td>Camera</td>
<td>18+24MP/24MP AI Camera</td>
</tr>
<tr>
<td>Battery</td>
<td>3400mAh</td>
</tr>
</tbody>
</table>
<h1>Display</h1>
<p>The first thing you&#8217;ll notice about the Honor 10&#8217;s display is the notch. It&#8217;s a small un-intrusive guy that can be switched on and off if you don&#8217;t like it. The display is slightly better than where we saw in the Honor View 10 and Honor 9, which is just fine for this phone. It offers an impressive media experience for photos and videos. This is one of the better non-AMOLED displays that you&#8217;ll find.</p>
<div id="attachment_218539" style="width: 1110px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1.jpg" data-rel="lightbox-image-0" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218539 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1.jpg" alt="" width="1100" height="734" srcset="https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1.jpg 1100w, https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1-300x200.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1-768x512.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/honor10_1-1-1024x683.jpg 1024w" sizes="(max-width: 1100px) 100vw, 1100px" /></a><p class="wp-caption-text">The Honor 10 with notched display.</p></div>
<h1>Camera</h1>
<p><iframe src="https://www.youtube.com/embed/ffR3LohQXrE" width="560" height="315" frameborder="0" allowfullscreen="allowfullscreen"></iframe></p>
<p>One of the main selling points of the Honor 10 is the AI Camera. This is designed to <a href="https://www.xda-developers.com/honor-10-multi-scene-detection-filters-camera/" title="">use semantic image segmentation</a> to enhance your photos. While the AI mode is definitely an interesting feature, it has received mixed reviews on whether or not is objectively makes the photograph better.</p>
<div class="row"><div class="col col_6_of_12"></p>
<p><div id="attachment_218137" style="width: 1210px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/honor1_no.jpg" data-rel="lightbox-image-1" data-rl_title="" data-rl_caption="" title=""><img class="size-full wp-image-218137" src="https://www1-lw.xda-cdn.com/files/2018/05/honor1_no.jpg" alt="" width="1200" height="900" srcset="https://www1-lw.xda-cdn.com/files/2018/05/honor1_no.jpg 1200w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_no-300x225.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_no-768x576.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_no-1024x768.jpg 1024w" sizes="(max-width: 1200px) 100vw, 1200px" /></a><p class="wp-caption-text">Honor 10 photo without AI Mode</p></div></p>
<p></div><div class="col col_6_of_12"></p>
<p><div id="attachment_218136" style="width: 1210px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai.jpg" data-rel="lightbox-image-2" data-rl_title="" data-rl_caption="" title=""><img class="size-full wp-image-218136" src="https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai.jpg" alt="" width="1200" height="900" srcset="https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai.jpg 1200w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai-300x225.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai-768x576.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/honor1_ai-1024x768.jpg 1024w" sizes="(max-width: 1200px) 100vw, 1200px" /></a><p class="wp-caption-text">Honor 10 with AI Mode</p></div></p>
<p></div> </div>
<p>These photos are a good example of a situation where AI does a great job in enhancing the photo.</p>
<div class="row"><div class="col col_6_of_12"></p>
<p><div id="attachment_218143" style="width: 1210px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/honor4_no.jpg" data-rel="lightbox-image-3" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218143 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/honor4_no.jpg" alt="" width="1200" height="900" srcset="https://www1-lw.xda-cdn.com/files/2018/05/honor4_no.jpg 1200w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_no-300x225.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_no-768x576.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_no-1024x768.jpg 1024w" sizes="(max-width: 1200px) 100vw, 1200px" /></a><p class="wp-caption-text">Honor 10 photo without AI Mode</p></div></p>
<p></div><div class="col col_6_of_12"></p>
<p><div id="attachment_218142" style="width: 1210px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai.jpg" data-rel="lightbox-image-4" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218142 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai.jpg" alt="" width="1200" height="900" srcset="https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai.jpg 1200w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai-300x225.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai-768x576.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/honor4_ai-1024x768.jpg 1024w" sizes="(max-width: 1200px) 100vw, 1200px" /></a><p class="wp-caption-text">Honor 10 with AI Mode</p></div></p>
<p></div> </div>
<p>These photos received mixed responses from people when <a href="https://twitter.com/XDARoni/status/996519679186227200" title="">I posted them to twitter</a>. Many people preferred the non-AI version. So while the AI is a nice feature to have, it wont perform well it every circumstance. You can toggle AI off after the fact, if you don&#8217;t like the way your picture turned out.</p>
<blockquote><p><span>&ldquo;</span>Shoot dynamically and enhance individually with Semantic image segmentation!<span>&rdquo;</span></p><footer>@Honorglobal</footer></blockquote>
<p>From my experience with AI mode, it&#8217;s a good feature to have but isn&#8217;t a revolutionary feature in smartphone cameras. This shouldn&#8217;t be a deciding factor in whether or not you buy this phone.</p>
<div id="attachment_223159" style="width: 1010px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-095546.jpg" data-rel="lightbox-image-5" data-rl_title="" data-rl_caption="" title=""><img class="size-full wp-image-223159" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-095546.jpg" alt="" width="1000" height="526" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-095546.jpg 1000w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-095546-300x158.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-095546-768x404.jpg 768w" sizes="(max-width: 1000px) 100vw, 1000px" /></a><p class="wp-caption-text">Honor 10 Gallery Video Editor</p></div>
<p>The Gallery app has many useful tools for editing your videos and photos. Trim your videos and export them at different resolutions. The fast processor in the Honor 10 makes editing media very fast and fluid.</p>
<div id="attachment_223165" style="width: 1010px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-100256.jpg" data-rel="lightbox-image-6" data-rl_title="" data-rl_caption="" title=""><img class="size-full wp-image-223165" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-100256.jpg" alt="" width="1000" height="527" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-100256.jpg 1000w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-100256-300x158.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-100256-768x405.jpg 768w" sizes="(max-width: 1000px) 100vw, 1000px" /></a><p class="wp-caption-text">Honor 10 Gallery Photo Editing</p></div>
<p>In general,the camera is better than any Honor phone we&#8217;ve seen so far. The selfie camera is really good with a 24MP sensor. Portrait mode looks particularly nice. Checkout our full camera review video above to see samples.</p>
<h1>Performance</h1>
<p>When it comes to speed, this phone is very impressive. The Kirin 970 is the newest Kirin chip featuring the NPU which powers all of the AI features in the Honor 10. There are models with 4 and 6GB of RAM. I tested the 4GB model to find that app were launching faster, the UI was quicker, and the phone was all-around smoother than any previous Honor phone.</p>
<p>The battery will easily last you all day and maybe even two days depending on your use. You have several ways to preserve battery with the <em>power saving mode</em>, ultra power saving mode, and adjusting the <em>screen resolution</em>.</p>
<div id="attachment_218663" style="width: 1210px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887.jpg" data-rel="lightbox-image-7" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218663 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887.jpg" alt="" width="1200" height="800" srcset="https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887.jpg 1200w, https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887-300x200.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887-768x512.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/IMG_2887-1024x683.jpg 1024w" sizes="(max-width: 1200px) 100vw, 1200px" /></a><p class="wp-caption-text">The Honor 10 scores a 197981 on AnTuTu benchmark</p></div>
<p><a href="https://youtu.be/X6zIVOdU1ys" data-rel="lightbox-video-0" title="">See how the Honor 10 stacks up against the Honor View 10.</a></p>
<div class="row"><div class="col col_4_of_12"></p>
<p><div id="attachment_223197" style="width: 495px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103958.jpg" data-rel="lightbox-image-8" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223197 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103958-485x1024.jpg" alt="" width="485" height="1024" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103958-485x1024.jpg 485w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103958-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103958.jpg 568w" sizes="(max-width: 485px) 100vw, 485px" /></a><p class="wp-caption-text">AnTuTu HTML5 Test</p></div></p>
<p></div><div class="col col_4_of_12"></p>
<p><div id="attachment_223198" style="width: 495px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103716.jpg" data-rel="lightbox-image-9" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223198 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103716-485x1024.jpg" alt="" width="485" height="1024" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103716-485x1024.jpg 485w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103716-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103716.jpg 568w" sizes="(max-width: 485px) 100vw, 485px" /></a><p class="wp-caption-text">GPU, UX and Memory Scores from AnTuTu</p></div></p>
<p></div><div class="col col_4_of_12"></p>
<p><div id="attachment_223200" style="width: 495px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103653.jpg" data-rel="lightbox-image-10" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223200 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103653-485x1024.jpg" alt="" width="485" height="1024" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103653-485x1024.jpg 485w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103653-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-103653.jpg 568w" sizes="(max-width: 485px) 100vw, 485px" /></a><p class="wp-caption-text">197981 Benchmark Score from AnTuTu</p></div></p>
<p></div></div>
<h2 style="padding-left: 30px;"><a href="https://www.xda-developers.com/tag/emui/" title="">EMUI</a> 8.1</h2>
<p><a href="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2986.jpg" data-rel="lightbox-image-11" data-rl_title="" data-rl_caption="" title=""><img class="alignnone size-full wp-image-223206" src="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2986.jpg" alt="" width="1000" height="338" srcset="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2986.jpg 1000w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2986-300x101.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2986-768x260.jpg 768w" sizes="(max-width: 1000px) 100vw, 1000px" /></a></p>
<p style="padding-left: 30px;">The Honor 10 ships with the latest EMUI update, bringing the UI to version 8.1. This is the most stock-like version of EMUI that we have seen. A lot of the old ugly icons and UI elements have been replaced. The useful stuff has remained and been improved, lik the built in screen recorder, the camera app, and the very underrated health app.</p>
<p style="padding-left: 30px;">EMUI is not without its problems though. The settings menu is baffling and difficult to navigate. The EMUI theme engine has always been a disappointment, features ugly themes and very little customization beyond a slightly modified icons pack, and a background image. Then there&#8217;s some strange bloatware, like a mirror app that simple activates your front facing camera. So EMUI, while getting better, still have some room for improvement.</p>
<div class="row"><div class="col col_4_of_12"></p>
<p><div id="attachment_218667" style="width: 578px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/emui1.jpg" data-rel="lightbox-image-12" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218667 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/emui1.jpg" alt="" width="568" height="1200" srcset="https://www1-lw.xda-cdn.com/files/2018/05/emui1.jpg 568w, https://www1-lw.xda-cdn.com/files/2018/05/emui1-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/05/emui1-485x1024.jpg 485w" sizes="(max-width: 568px) 100vw, 568px" /></a><p class="wp-caption-text">EMUI 8.1 Homescreen</p></div></p>
<p></div><div class="col col_4_of_12"></p>
<p><div id="attachment_218668" style="width: 578px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/emui2.jpg" data-rel="lightbox-image-13" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218668 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/emui2.jpg" alt="" width="568" height="1200" srcset="https://www1-lw.xda-cdn.com/files/2018/05/emui2.jpg 568w, https://www1-lw.xda-cdn.com/files/2018/05/emui2-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/05/emui2-485x1024.jpg 485w" sizes="(max-width: 568px) 100vw, 568px" /></a><p class="wp-caption-text">EMUI 8.1 App Drawer</p></div></p>
<p></div><div class="col col_4_of_12"></p>
<p><div id="attachment_218669" style="width: 578px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/emui3.jpg" data-rel="lightbox-image-14" data-rl_title="" data-rl_caption="" title=""><img class="size-full wp-image-218669" src="https://www1-lw.xda-cdn.com/files/2018/05/emui3.jpg" alt="" width="568" height="1200" srcset="https://www1-lw.xda-cdn.com/files/2018/05/emui3.jpg 568w, https://www1-lw.xda-cdn.com/files/2018/05/emui3-142x300.jpg 142w, https://www1-lw.xda-cdn.com/files/2018/05/emui3-485x1024.jpg 485w" sizes="(max-width: 568px) 100vw, 568px" /></a><p class="wp-caption-text">EMUI 8.1 Settings Menu</p></div></p>
<p></div></div>
<h1>Design</h1>
<p>Since the <a href="https://forum.xda-developers.com/honor-8" title="">Honor 8</a>, Honor has proven that build quality is a main focus of their flagship line. The iconic light-catching material that makes up the back of the phone appears once again in the Honor 10, this time branded as the <em>aurora glass design</em>. The design looks best on their newest color called <em>Phantom Green</em>, where the light reflections will reveal several different colors beneath the glass surface.</p>
<div id="attachment_218673" style="width: 1089px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/05/Honor-10.jpg" data-rel="lightbox-image-15" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-218673 size-full" src="https://www1-lw.xda-cdn.com/files/2018/05/Honor-10.jpg" alt="" width="1079" height="462" srcset="https://www1-lw.xda-cdn.com/files/2018/05/Honor-10.jpg 1079w, https://www1-lw.xda-cdn.com/files/2018/05/Honor-10-300x128.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/05/Honor-10-768x329.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/05/Honor-10-1024x438.jpg 1024w" sizes="(max-width: 1079px) 100vw, 1079px" /></a><p class="wp-caption-text">The Honor 10 with Aurora Glass Design.</p></div>
<p>&nbsp;</p>
<div id="attachment_223186" style="width: 910px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983.jpg" data-rel="lightbox-image-16" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223186 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983-1024x683.jpg" alt="" width="900" height="600" srcset="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983-1024x683.jpg 1024w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983-300x200.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983-768x512.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2983.jpg 1080w" sizes="(max-width: 900px) 100vw, 900px" /></a><p class="wp-caption-text">The Dual Lens AI Camera on the Honor 10</p></div>
<p>&nbsp;</p>
<div id="attachment_223185" style="width: 910px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984.jpg" data-rel="lightbox-image-17" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223185 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984-1024x683.jpg" alt="" width="900" height="600" srcset="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984-1024x683.jpg 1024w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984-300x200.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984-768x512.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2984.jpg 1080w" sizes="(max-width: 900px) 100vw, 900px" /></a><p class="wp-caption-text">Honor 10 Notch on the Top of the Display</p></div>
<p>&nbsp;</p>
<div id="attachment_223183" style="width: 910px" class="wp-caption alignnone"><a href="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985.jpg" data-rel="lightbox-image-18" data-rl_title="" data-rl_caption="" title=""><img class="wp-image-223183 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985-1024x683.jpg" alt="" width="900" height="600" srcset="https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985-1024x683.jpg 1024w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985-300x200.jpg 300w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985-768x512.jpg 768w, https://www1-lw.xda-cdn.com/files/2018/06/IMG_2985.jpg 1080w" sizes="(max-width: 900px) 100vw, 900px" /></a><p class="wp-caption-text">Honor 10 in Black with Aurora Design</p></div>
<p>&nbsp;</p>
<h1>Conclusion</h1>
<p>Having spent two weeks using the Honor 10 as my primary phone, I&#8217;ve realized that I like the phone regardless of its AI features. While the AI is fun to play around with, if it was removed from the phone, my experience wouldn&#8217;t change much. If you&#8217;re looking for this phone to have a revolutionary AI experience, you&#8217;re not going to find it. What you will find is a beautiful phone with shockingly good performance and a crazy low price starting at £399.99.</p>
<p>Join the discussions about the Honor 10 in the XDA Forums.</p>
<p><a href="https://www.hihonor.com/global/products/mobile-phones/honor10/index.html" class="btn btn_default" target="_self" style="background-color:#b70900; color:#ffffff;">HiHonor Website</a><a href="https://forum.xda-developers.com/honor-10" class="btn btn_default" target="_self" style="background-color:#b70900; color:#ffffff;">Honor 10 Forums</a></p>
<p class="clear:both;">
]]></content:encoded>
			</item>
		<item>
		<title>Developers are facing huge drop in new installs after Play Store algorithm changes</title>
		<link>https://www.xda-developers.com/developers-huge-drop-new-installs-play-store-algorithm-changes/</link>
		<comments>https://www.xda-developers.com/developers-huge-drop-new-installs-play-store-algorithm-changes/#respond</comments>
		<pubDate>Wed, 27 Jun 2018 22:12:25 +0000</pubDate>
		<dc:creator><![CDATA[Mishaal Rahman]]></dc:creator>
				<category><![CDATA[Developments]]></category>
		<category><![CDATA[Full XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[android apps]]></category>
		<category><![CDATA[app development]]></category>
		<category><![CDATA[application]]></category>
		<category><![CDATA[Applications]]></category>
		<category><![CDATA[apps]]></category>
		<category><![CDATA[develop]]></category>
		<category><![CDATA[developer]]></category>
		<category><![CDATA[developer console]]></category>
		<category><![CDATA[developers]]></category>
		<category><![CDATA[Games]]></category>
		<category><![CDATA[Google Play Games]]></category>
		<category><![CDATA[Google Play Store]]></category>
		<category><![CDATA[play developer console]]></category>
		<category><![CDATA[Play Games]]></category>
		<category><![CDATA[play store]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=223557</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/play-store-drop-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="Google Play Store drop" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Some Android app and game developers are panicking because their daily installation rates have plummeted in the past week. These developers have noticed new downloads slow down by up to 90%. The affected developers quickly realized they were not alone in these changes to their day-to-day app installation rate with multiple threads on Reddit, a]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/play-store-drop-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="Google Play Store drop" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Some Android app and game developers are panicking because their daily installation rates have plummeted in the past week. These developers <a href="https://www.reddit.com/r/androiddev/comments/8ubsre/significant_drop_in_downloads_since_june_20_many/">have noticed</a> new downloads slow down by up to 90%. The affected developers quickly realized they were not alone in these changes to their day-to-day app installation rate with <a href="https://www.reddit.com/r/androiddev/comments/8tp666/sudden_decrease_in_organic_downloads/">multiple</a> <a href="https://www.reddit.com/r/androiddev/comments/8tgzhj/drastic_drop_in_downloads_in_all_of_my_apps/">threads</a> <a href="https://www.reddit.com/r/androiddev/comments/8t935n/huge_drop_in_downloads_over_the_past_48_hours/">on</a> <a href="https://www.reddit.com/r/androiddev/comments/8t8u7z/my_app_is_suddenly_dying_on_the_play_store/">Reddit</a>, a post on the <a href="https://forum.unity.com/threads/sudden-drop-in-number-of-daily-installs-on-google-play-store.537467/">Unity forums</a>, and even a <a href="https://www.gamasutra.com/blogs/VladChetrusca/20180626/320734/Thousands_of_indie_android_devs_on_the_brink_of_extinction_after_Play_store_changes_visibility_algorithm_rules.php">Gamasutra community blog post</a> popping up to help spread the word that something was amiss. Clearly, something is wrong here, and some indie developers are concerned that their livelihood may be at stake. So what&#8217;s going on?</p>
<hr />
<h2>Play Store&#8217;s Algorithm Quietly Changes, Tanking Some Apps&#8217; Rankings</h2>
<p>It appears that sometime last week, Google tweaked the Play Store&#8217;s algorithm that determines app discovery. When we reached out to Google about the matter, we were told that Google is regularly evaluating new ways to improve the Play Store&#8217;s ranking algorithms to promote high-quality applications. We would like to stress that there is <strong>no evidence that Google is altering the algorithm to intentionally harm indie developers in favor of big-name apps</strong> (despite rampant speculation otherwise). The changes are aimed at improving the experience for both users and developers alike.</p>
<p>We do not have any details on exactly <em>how</em> the algorithm was changed (which makes sense, as disclosing that information would give an unfair advantage to certain developers) but it&#8217;s clear that the changes are making a significant impact on some independent developers.</p>
<p>Here&#8217;s just one example of many:</p>
<div id="attachment_223561" style="width: 799px" class="wp-caption aligncenter"><img class="wp-image-223561 size-full" src="https://www1-lw.xda-cdn.com/files/2018/06/PickCrafter-Download-Stats.png" alt="Google Play Store Algorithm Changes" width="789" height="422" srcset="https://www1-lw.xda-cdn.com/files/2018/06/PickCrafter-Download-Stats.png 789w, https://www1-lw.xda-cdn.com/files/2018/06/PickCrafter-Download-Stats-300x160.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/PickCrafter-Download-Stats-768x411.png 768w" sizes="(max-width: 789px) 100vw, 789px" /><p class="wp-caption-text">PickCrafter daily installation statistics</p></div>
<p>The screenshot shown above is from the Developer Console statistics for a game called &#8220;PickCrafter.&#8221; The developer graciously shared their Play Store installation metrics with us to demonstrate the issue. As you can see, the app hovered around 3,000-4,500 daily installs until the past week when the rate dipped into the low 1,000s.</p>
<!-- WP-Appbox (Version: 4.0.53 // Store: googleplay // ID: com.fiveamp.pickcrafterapp) --><p><a target="_blank" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.fiveamp.pickcrafterapp" title="PickCrafter - Idle Crafting Game">PickCrafter - Idle Crafting Game (Free<sup>+</sup>, Google Play) →</a></p><!-- /WP-Appbox -->
<p>This developer isn&#8217;t alone by any means. We&#8217;ve heard numerous anecdotes from independent developers over on a dedicated <a href="https://www.xda-developers.com/official-xda-developers-discord-server/">Discord</a> group <a href="https://discord.gg/5Hny2Xy">for the issue</a>. They all told us the same story &#8211; starting last week their app&#8217;s daily installation numbers tanked and haven&#8217;t recovered since. Although most of the affected apps appear to be Android games, several non-gaming apps have also been affected. We do not have any details on how many games versus non-games are affected.</p>
<p>Here&#8217;s a brief summary of how hard some developers have been hit by the algorithm changes:</p>
<ul>
<li>Developer peanutbutterlabs reports that their daily downloads dipped to <strong>5,000 from an average of 80,000</strong> per day.</li>
<li>Developer Butterbean21 reports an <strong>80% drop</strong> in their top-performing apps.</li>
<li>Developer Jenzo83 reports an <strong>80-90% drop</strong> for their games.</li>
<li>Developer snoutup reports their rates dropped by &#8220;only&#8221; <strong>70%</strong>.</li>
<li>Developer llliorrr reports an <strong>80% drop</strong> for 28 out of their 30 apps.</li>
<li>Developer AxPetre reports a drop in installation rates from <strong>12,000/day to 5,000/day</strong>.</li>
<li>Developer slothinspace reports a drop from <strong>1,500+ downloads to 100+</strong>.</li>
<li>Developer janikkk reports an <strong>80% drop</strong>.</li>
<li>Developer zenderfile reports a drop from <strong>12,000/day to 1,500/day</strong>.</li>
<li>Developer livenets reports a drop from <strong>32,000/day to 4,000/day</strong>.</li>
</ul>
<p>And here are some additional screenshots that show a significant drop in installation numbers, courtesy of Redditor <a href="https://www.reddit.com/user/alpha724">alpha724</a>.</p>

<a href='https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-1.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-6"><img width="900" height="422" src="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-1.png" class="attachment-large size-large rl-gallery-link"  alt="Google Play Store Algorithm Changes" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-1.png 980w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-1-300x141.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-1-768x360.png 768w" sizes="(max-width: 900px) 100vw, 900px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-2.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-6"><img width="900" height="421" src="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-2.png" class="attachment-large size-large rl-gallery-link"  alt="Google Play Store Algorithm Changes" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-2.png 977w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-2-300x140.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-2-768x359.png 768w" sizes="(max-width: 900px) 100vw, 900px" /></a>
<a href='https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-3.png' title="" data-rl_title="" data-rl_caption="" data-rel="lightbox-gallery-6"><img width="900" height="422" src="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-3.png" class="attachment-large size-large rl-gallery-link"  alt="Google Play Store Algorithm Changes" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-3.png 979w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-3-300x141.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Install-Drop-3-768x360.png 768w" sizes="(max-width: 900px) 100vw, 900px" /></a>

<p>For what it&#8217;s worth, <em>XDA-Developers</em>&#8216;s very own <a href="https://play.google.com/store/apps/details?id=com.xda.nobar">Navigation Gestures</a> app has been unaffected by these changes. However, we&#8217;re fortunate in that we would be able to survive a change in the algorithm affecting our rankings &#8211; after all, we have a strong following on the Portal, our <a href="https://www.youtube.com/user/xdadevelopers/videos">YouTube channel</a>, our <a href="https://twitter.com/xdadevelopers">Twitter account</a>, etc through which we can promote the app. Independent developers who rely on organic growth via the Play Store don&#8217;t have access to such an audience without spending significant income on advertising, so these affected developers are worried that the changes may harm their apps&#8217; success. Developers that rely on ad views for income are especially concerned with the changes since their revenue is directly dependent on the number of ad impressions they get.</p>
<h2>What May Have Caused These Drastic Drops In Numbers?</h2>
<p>Developers on the Unity forums have eliminated several possibilities behind the changes, including inaccurate installs reported on the Play Developer Console, issues identified through Android vitals, search rankings, summer exams, and the FIFA World Cup. One possible cause behind the issue that has been identified (and which we can confirm) is a mismatch between an app&#8217;s category, description, and content with the apps shown on the &#8220;Similar Apps&#8221; panel. As you can see below, a game called &#8220;Kids Cash Register Grocery Free&#8221; has a rather odd assortment of &#8220;Similar&#8221; apps shown for it.</p>
<p><img class="aligncenter size-large wp-image-223566" src="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Similar-Apps-Mismatch-1024x829.png" alt="Play Store" width="900" height="729" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Similar-Apps-Mismatch-1024x829.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Similar-Apps-Mismatch-300x243.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Similar-Apps-Mismatch-768x622.png 768w, https://www1-lw.xda-cdn.com/files/2018/06/Play-Store-Similar-Apps-Mismatch.png 1063w" sizes="(max-width: 900px) 100vw, 900px" /></p>
<p>Likewise, another issue seems to be that certain categories aren&#8217;t loading for desktop users in certain countries. For instance, the &#8220;<a href="https://play.google.com/store/apps/category/GAME_CASINO">Casino Games</a>&#8221; category fails to load for me and several others in the United States and Canada when browsing the Google Play Store on desktop Google Chrome. However, the category does load appropriately on mobile devices and the Play Store accessed from a <a href="https://www.xda-developers.com/tag/chromebook/">Chromebook</a>. <strong>We doubt that this particular issue is contributing significantly to the drop in numbers</strong> that developers are experiencing, but it&#8217;s certainly one possibility.</p>
<h2>What Actions Developers Can Take</h2>
<p>We do not know if the changes are permanent. Regardless, this should be a clear wake-up call for indie developers that any slight change in the Play Store&#8217;s ranking algorithm can significantly impact your app&#8217;s success. Developers are encouraged to proactively improve their app&#8217;s quality. Google has published recommendations on how to do so on the <a href="https://android-developers.googleblog.com/2017/08/how-were-helping-people-find-quality.html" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://android-developers.googleblog.com/2017/08/how-were-helping-people-find-quality.html&amp;source=gmail&amp;ust=1530217104081000&amp;usg=AFQjCNG_h926nQOYyAYlrK3mh76h1AN5dg">Android Developers Blog</a> and <a href="https://developer.android.com/docs/quality-guidelines/" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?hl=en&amp;q=https://developer.android.com/docs/quality-guidelines/&amp;source=gmail&amp;ust=1530217104081000&amp;usg=AFQjCNEKBnWG2zuKjdZl85nZnXTCBsJo4Q">Quality Guidelines documentation page</a>. If Google tweaks the algorithm again or makes a public statement on the matter, we&#8217;ll be sure to let you all know.</p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/developers-huge-drop-new-installs-play-store-algorithm-changes/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>YouTube picture-in-picture rolling out more widely in the US for non-Red/Premium users</title>
		<link>https://www.xda-developers.com/youtube-picture-in-picture-rolling-out-us-non-red-premium-users/</link>
		<comments>https://www.xda-developers.com/youtube-picture-in-picture-rolling-out-us-non-red-premium-users/#respond</comments>
		<pubDate>Tue, 26 Jun 2018 15:55:50 +0000</pubDate>
		<dc:creator><![CDATA[George Burduli]]></dc:creator>
				<category><![CDATA[Mini XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[picture-in-picture]]></category>
		<category><![CDATA[Youtube]]></category>
		<category><![CDATA[YouTube for Android]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=223146</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/youtube-dark-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="carstream android auto youtube" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Google added picture-in-picture mode support for Android smartphones back in 2017 with the release of Android Oreo. For a long time, only the premium version of YouTube (be it YouTube Red or YouTube Premium) supported the feature, which means you had to pay for it. Last month, some people started noticing that the feature was]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/youtube-dark-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="carstream android auto youtube" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Google added picture-in-picture mode support for Android smartphones back in 2017 with the release of <a href="https://www.xda-developers.com/tag/android-oreo/">Android Oreo</a>. For a long time, only the premium version of YouTube (be it YouTube Red or YouTube Premium) supported the feature, which means you had to pay for it. Last month, <a href="https://www.xda-developers.com/youtube-picture-in-picture-without-youtube-red/">some people started noticing that the feature was available for them</a> even though they weren&#8217;t using a paid service. Today, we&#8217;ve noticed that PiP for YouTube is rolling out more widely.</p>
<p>Some of our own writers noted that picture-in-picture mode started working for them today, though we should note that only our writers located in the United States could confirm that PiP was working. It&#8217;s common practice for Google to gradually roll out some features, and it seems that picture-in-picture mode support is definitely one of them. From the looks of it, the feature is rolling out via a server-side switch as our writers with the feature noted that they&#8217;re using different versions of the application.</p>
<p><img class="aligncenter wp-image-223148 size-large" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101810-512x1024.png" alt="" width="512" height="1024" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101810-512x1024.png 512w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101810-150x300.png 150w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101810.png 600w" sizes="(max-width: 512px) 100vw, 512px" /></p>
<p>A toggle for the picture-in-picture mode feature also appeared in the YouTube settings. It comes with a little instruction about how to use the feature. You can test it pretty easily. After making sure that you&#8217;ve toggled picture-in-picture mode in both the YouTube app and system settings, just open up a video and tap on the home button. If you don&#8217;t see the PiP toggle in YouTube&#8217;s settings, that means that you haven&#8217;t received the feature yet.</p>
<p><img class="aligncenter size-medium wp-image-223150" src="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101734-300x88.png" alt="" width="300" height="88" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101734-300x88.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101734-768x225.png 768w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101734-1024x300.png 1024w, https://www1-lw.xda-cdn.com/files/2018/06/Screenshot_20180626-101734.png 1200w" sizes="(max-width: 300px) 100vw, 300px" /></p>
<p>Please keep in mind that the uploader of the video can restrict access to picture-in-picture mode (which is why most music videos don&#8217;t work). As expected, PiP doesn&#8217;t work with most music videos. But, it&#8217;s great for watching <a href="https://www.youtube.com/user/xdadevelopers">informative XDA videos</a> and other non-music related content.</p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/youtube-picture-in-picture-rolling-out-us-non-red-premium-users/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>3 Samsung Galaxy S10 models may launch w/ one having triple cameras</title>
		<link>https://www.xda-developers.com/3-samsung-galaxy-s10-models-may-launch-w-one-having-triple-cameras/</link>
		<comments>https://www.xda-developers.com/3-samsung-galaxy-s10-models-may-launch-w-one-having-triple-cameras/#respond</comments>
		<pubDate>Tue, 26 Jun 2018 03:30:52 +0000</pubDate>
		<dc:creator><![CDATA[Doug Lynch]]></dc:creator>
				<category><![CDATA[Full XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[Samsung]]></category>
		<category><![CDATA[Samsung Galaxy S10]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=221754</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/samsung-update-firmware-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />We haven&#8217;t even made it to the release of the Samsung Galaxy Note 9 which is scheduled for later this year and there have already been a number of rumors for the company&#8217;s next Galaxy S series. Rumors have suggested the upcoming flagship from Samsung will have an in-display fingerprint scanner (which, to be fair, has]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/samsung-update-firmware-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">We haven&#8217;t even made it to the release of the Samsung Galaxy Note 9 which is scheduled for later this year and there have already been a number of rumors for the company&#8217;s next Galaxy S series. Rumors have suggested the upcoming flagship from Samsung will <a href="https://www.xda-developers.com/samsung-galaxy-s10-in-display-fingerprint-scanner/" target="_blank" rel="noopener">have an in-display fingerprint scanner</a> (which, to be fair, has been speculated about since the ill-fated Samsung <a href="https://forum.xda-developers.com/note-7">Galaxy Note 7</a>), <a href="https://www.xda-developers.com/samsung-galaxy-s10-triple-rear-cameras/" target="_blank" rel="noopener">three cameras on the back</a>, and <a href="https://www.xda-developers.com/samsung-galaxy-s10-lg-g8-sound-emitting-oled/" target="_blank" rel="noopener">a sound-emitting OLED display</a> to replace the earpiece speaker. Here&#8217;s another rumor to add to that list: The Samsung Galaxy S10 will come in three variants with the biggest one having the previously rumored triple rear cameras. Also, the latest Samsung flagship may be equipped with UFS 3.0 storage chips and LPDDR5 RAM.</p>
<p>There has been talk about the Galaxy S10 having three cameras for a few weeks now but now the notable Chinese publication <a href="http://www.etnews.com/20180625000323?mc=em_001_00001"><em>ETNews</em></a> (via @<a href="https://twitter.com/UniverseIce/status/1011166911323766784">UniverseIce</a>) corroborated this rumor and added further details about the Samsung Galaxy S10 variants and some of their features. If true, it looks as if Samsung will be selling three different variants of their 2019 flagship smartphone. The regular device is said to have a 5.8&#8243; display and come equipped with 1 rear camera. Then we have the middle version which will have a 5.8&#8243; display as well but this one will come with 2 rear cameras. Finally, the third model of the Samsung Galaxy S10 will have a big 6.2&#8243; display with 3 rear cameras. In summary:</p>
<ul>
<li>5.8&#8243; Samsung Galaxy S10 with 1 Rear Camera</li>
<li>5.8&#8243; Samsung Galaxy S10 with 2 Rear Cameras</li>
<li>6.2&#8243; Samsung Galaxy S10 with 3 Rear Cameras</li>
</ul>
<p>Having a smartphone with three rear cameras isn&#8217;t something that everyone will be taking advantage of to its full extent. On the other hand, the storage performance is something that&#8217;ll affect everyone&#8217;s experiences. <a href="https://twitter.com/UniverseIce/status/1007122927400075266">According to @UniverseIce</a>, a notable leaker of Samsung products, the Galaxy S10 will have UFS 3.0 flash storage and LPDDR5 RAM. The addition of UFS 3.0 is a benefit that everyone will see as it will impact application and game launch times, document/image/video creation, and much more. Samsung has also been preparing for mass production of LPDDR5 mobile RAM, so we expect to see performance improvements throughout the OS as well. The timeline has things laid out where Samsung could very well implement them into their first 2019 flagship smartphone.</p>
<div id="attachment_223045" style="width: 857px" class="wp-caption aligncenter"><img class="wp-image-223045 size-full" src="https://www1-lw.xda-cdn.com/files/2018/06/UFS-2.1-vs-3.0.png" alt="UFS 2.1 vs 3.0" width="847" height="273" srcset="https://www1-lw.xda-cdn.com/files/2018/06/UFS-2.1-vs-3.0.png 847w, https://www1-lw.xda-cdn.com/files/2018/06/UFS-2.1-vs-3.0-300x97.png 300w, https://www1-lw.xda-cdn.com/files/2018/06/UFS-2.1-vs-3.0-768x248.png 768w" sizes="(max-width: 847px) 100vw, 847px" /><p class="wp-caption-text">Source: <a href="https://en.wikipedia.org/wiki/Universal_Flash_Storage#Version_comparison">Wikipedia</a></p></div>
<p>Just what is UFS? It stands for the Universal Flash Storage standard that debuted in 2011 with version 1.0 and it aims to bring higher data transfer speed and increased reliability to flash memory storage. Over time we have seen this specification updated from version 1.0, to 1.1, to 2.0, then 2.1 and now to version 3.0. UFS 2.0 and 2.1 had a maximum bandwidth limit of 600 MB/s per lane so its two lanes allowed it to hit a theoretical max of 1,200 MB/s. Version 3.0 of the UFS specification was announced and published back in January of this year and promises faster transfer limits, lower power usage, and a number of new features which are mainly suited for the automotive industry. With UFS 3.0 the specification shows that these storage chips will be able to hit a theoretical maximum of 1,450 MB/s per lane and with it also supporting 2 lanes this means it can go as high as 2,900 MB/s.</p>
<p>Android&#8217;s storage benchmark scores have fallen behind the competition so this update to flash storage should help to narrow the gap. Ice Universe says that Samsung will begin mass producing both UFS 3.0 chips as well as LPDDR5 RAM chips in the second half of this year which implies that the Galaxy S10 will benefit from these new technologies.</p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/3-samsung-galaxy-s10-models-may-launch-w-one-having-triple-cameras/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>LineageOS 15.1 now supports A/B devices starting with the Motorola Moto Z2 Force</title>
		<link>https://www.xda-developers.com/lineageos-15-1-supports-a-b-devices-moto-z2-force/</link>
		<comments>https://www.xda-developers.com/lineageos-15-1-supports-a-b-devices-moto-z2-force/#respond</comments>
		<pubDate>Mon, 25 Jun 2018 15:42:00 +0000</pubDate>
		<dc:creator><![CDATA[Aamir Siddiqui]]></dc:creator>
				<category><![CDATA[Developments]]></category>
		<category><![CDATA[Featured]]></category>
		<category><![CDATA[Mini XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[Essential PH-1]]></category>
		<category><![CDATA[Essential Phone]]></category>
		<category><![CDATA[Google Pixel]]></category>
		<category><![CDATA[Google Pixel 2]]></category>
		<category><![CDATA[google Pixel 2 XL]]></category>
		<category><![CDATA[Google Pixel XL]]></category>
		<category><![CDATA[lineageos]]></category>
		<category><![CDATA[LineageOS 15]]></category>
		<category><![CDATA[moto z2 force]]></category>
		<category><![CDATA[Motorola Moto Z2 Force]]></category>
		<category><![CDATA[Seamless System Update]]></category>
		<category><![CDATA[seamless update]]></category>
		<category><![CDATA[Xiaomi Mi A1]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=222294</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/LineageOS-15.1-1-1-1-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="lineageos 15.1 android go" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />One of the more exciting changes that Android Nougat 7.0 brought was the introduction of A/B dual partition scheme for devices launched with this OS version. This change tackled how Android system updates are applied to devices, with the aim to provide a seamless upgrade experience to the user where a simple and quick reboot]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/05/LineageOS-15.1-1-1-1-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="lineageos 15.1 android go" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">One of the more exciting changes that <a href="https://www.xda-developers.com/tag/android-nougat/">Android Nougat</a> 7.0 brought was the introduction of A/B dual partition scheme for devices launched with this OS version. This change tackled how Android system updates are applied to devices, with the aim to provide a seamless upgrade experience to the user where a simple and quick reboot brings them into the updated OS. This change also added the benefit of a failsafe which ensured that at least one workable booting system remains on the device during an OTA update, allowing devices to &#8220;rollback&#8221; to the older system if an OTA fails to boot.</p>
<p>Unfortunately, not every device that has received <a href="https://www.xda-developers.com/tag/android-nougat/">Android 7.0</a> supports this A/B dual partition scheme. This A/B partition scheme is mostly seen on devices that originally shipped with Android Nougat 7.0+, as updating a device to Nougat and then supporting this change would require a repartitioning, which was considered a risky proposition by many OEMs. <a href="https://www.xda-developers.com/list-android-devices-seamless-updates/">Here is a list of devices</a> that support A/B seamless updates. Alternatively, you can also <a href="https://www.xda-developers.com/how-to-check-android-device-supports-seamless-updates/">manually check whether your device supports seamless updates</a>.</p>
<p>While the A/B dual partition scheme is largely well received, it did pose a challenge for the custom ROM community. <a href="https://source.android.com/devices/tech/ota/ab/ab_implement">A/B devices did not come with a recovery partition</a> as the Android system did not have a need for these partitions, so the community had to adapt its ways. <a href="https://www.xda-developers.com/twrp-v3-1-0-is-now-rolling-out-with-support-for-adb-backup-ab-ota-zips-and-more/">TWRP v3.1.0 was released with support for A/B devices</a>, while <a href="https://www.xda-developers.com/magisk-14-1-official-google-pixel-support/">Magisk brought support for A/B devices with version 14.1</a>.</p>
<p>Now, <a href="https://www.xda-developers.com/tag/lineageos/">LineageOS</a> 15.1 is adding in support for A/B devices. Support was delayed on 15.1 as the <a href="https://www.xda-developers.com/lineageos-15-1-changelog-reader-mode-chrome-home-jelly-network-restrictions/">LineageOS team was working to fix their addon.d script</a>. This script is responsible for backing up GApps and Lineage&#8217;s SU addon, and it needed modifications to properly work with A/B devices. The following people were involved in making this development happen (apologies if we missed anyone.)</p>
		
				<div class="accordion_content">
					<h4 class="accordion_content_title">Contributions to making A/B support possible for LineageOS 15.1</h4>
					<div class="accordion_content_inner">
						</p>
<ul>
<li>XDA Recognized Developer <a href="https://forum.xda-developers.com/member.php?u=2385005">invisiblek</a> &#8211; Wrote addon.d-v2/backuptool_ab and contributed original patches to for the A/B updater</li>
<li>XDA Senior Member <a href="https://forum.xda-developers.com/member.php?u=5848265">npjohnson</a> &#8211; Maintained addon.d-v2/backuptool_ab and implemented some fixes. Worked with external projects (OpenGApps/Magisk) to help get them compatible with the new tool.</li>
<li>XDA Senior Member <a href="https://forum.xda-developers.com/member.php?u=6070905">abhishek987</a> &#8211; Maintained addon.d-v2/backuptool_ab, helped debug/fix it along the way,</li>
<li><a href="https://github.com/gmrt">gmrt</a> &#8211; Set up the A/B seamless updater, added support for a variety of A/B functions in Updater, build.prop exposure to start releasetools for A/B, switch to unresttrict update_engine (WIP)</li>
<li>XDA Recognized Developer <a href="https://forum.xda-developers.com/member.php?u=4126377">tdm</a> &#8211; Brought Lineage recovery up, the platform to ship on A/B as the built-in recovery</li>
<li>XDA Recognized Developer <a href="https://forum.xda-developers.com/member.php?u=3463426">raymanfx</a> &#8211; various recovery patches to allow for installing old style zips and newer payload style zips, some AVB tool work, making addonsu A/B compatible</li>
<li>XDA Senior Member <a href="http://forum.xda-developers.com/member.php?u=1815755">intervigil</a> &#8211; Android Verified Boot logic, and tool to disable/deal with it</li>
<li>XDA Inactive Recognized Developer <a href="https://forum.xda-developers.com/member.php?u=4662457">Rashed97</a> &#8211; addon.d contributions and platform login</li>
</ul>
<p>

					</div>
				</div>
				
<p>Initially, only the Motorola <a href="https://forum.xda-developers.com/z2-force">Moto Z2 Force</a> (nash) has <a href="https://review.lineageos.org/#/c/LineageOS/hudson/+/218033/">been added to the roster</a>, with support expected for more devices in the future. <strong>The Moto Z2 Force&#8217;s <a href="https://download.lineageos.org/nash">build will roll out tomorrow</a>. </strong>The Z2 Force&#8217;s build is being maintained by XDA Senior Member <a href="https://forum.xda-developers.com/member.php?u=5848265">npjohnson</a>.</p>
<p>We expect the following devices to soon receive support once all of the device-specific bugs have been fixed:</p>
<ul>
<li><a href="https://forum.xda-developers.com/pixel">Google Pixel</a></li>
<li><a href="https://forum.xda-developers.com/pixel-xl">Google Pixel XL</a></li>
<li><a href="https://forum.xda-developers.com/pixel-2">Google Pixel 2</a></li>
<li><a href="https://forum.xda-developers.com/pixel-2-xl">Google Pixel 2 XL</a></li>
<li><a href="https://forum.xda-developers.com/essential-phone">Essential Phone PH-1</a></li>
<li><a href="https://forum.xda-developers.com/mi-a1">Xiaomi Mi A1</a></li>
</ul>
<p>In fact, we expect the Xiaomi Mi A1 to receive support very soon given the comments <a href="https://review.lineageos.org/#/c/LineageOS/lineage_wiki/+/218173/">here</a>. Likewise, a <a href="https://review.lineageos.org/#/c/LineageOS/hudson/+/218594/">bug related to the Bluetooth MAC</a> needs to be fixed before the build for the Essential Phone will land. We&#8217;ll keep you updated once the official LineageOS 15.1 builds for the other A/B devices start to roll out.</p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/lineageos-15-1-supports-a-b-devices-moto-z2-force/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>Huawei P20 Pro update adds 960fps slow motion like the Samsung Galaxy S9</title>
		<link>https://www.xda-developers.com/huawei-p20-pro-update-960fps-slow-motion/</link>
		<comments>https://www.xda-developers.com/huawei-p20-pro-update-960fps-slow-motion/#respond</comments>
		<pubDate>Mon, 25 Jun 2018 14:15:00 +0000</pubDate>
		<dc:creator><![CDATA[George Burduli]]></dc:creator>
				<category><![CDATA[Mini XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[android 8.1]]></category>
		<category><![CDATA[Android Oreo]]></category>
		<category><![CDATA[huawei]]></category>
		<category><![CDATA[Huawei P20]]></category>
		<category><![CDATA[samsung galaxy s9]]></category>
		<category><![CDATA[Slow Motion]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=222304</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/HUAWEI-P20-Pro-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Huawei released the P20 trio (Huawei P20, Huawei P20 Lite, and Huawei P20 Pro) back in April. While the Lite version is a mid-range device, the regular P20 and P20 Pro versions are both flagships. In the recent months, Huawei really stepped up their development. The P20 Pro already comes with Android 8.1 Oreo and]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/03/HUAWEI-P20-Pro-150x150.png" class="webfeedsFeaturedVisual wp-post-image" alt="" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Huawei released the P20 trio (<a href="https://forum.xda-developers.com/huawei-p20">Huawei P20</a>, <a href="https://forum.xda-developers.com/huawei-p20-lite">Huawei P20 Lite</a>, and <a href="https://forum.xda-developers.com/huawei-p20-pro">Huawei P20 Pro</a>) back in April. While the Lite version is a mid-range device, the regular P20 and P20 Pro versions are both flagships. In the recent months, Huawei really stepped up their development. The P20 Pro already comes with <a href="https://www.xda-developers.com/tag/android-oreo/">Android 8.1</a> Oreo and as it turns out, it&#8217;s getting <a href="https://www.xda-developers.com/huawei-p20-huawei-mate-10-pro-and-sony-xperia-xz2-gain-netflix-hdr-support/">pretty frequent updates too</a>. Last week, Junior Member at XDA Forums, <a href="https://forum.xda-developers.com/member.php?u=4680991">tamaskurti</a> reported that the device got a new update, with build number CLT-L29C432B131.</p>
<p>The first feature in the update is the June security patch. While it&#8217;s been about <a href="https://www.xda-developers.com/android-security-update-june-pixel-nexus/">2 weeks since the release of this patch</a>, it&#8217;s still nice to see that Huawei isn&#8217;t delaying security updates any further. True, <a href="https://www.xda-developers.com/essential-phone-android-p-beta-2-june-security-patches/">Essential releases security updates</a> almost instantly after they&#8217;re available, but Huawei still manages to bring some competition to the table compared to other large OEMs.</p>
<p>The next new feature is camera improvements. The zoom button is now placed lower on the screen. I think it&#8217;s much more comfortable to use now. But, for unknown reasons, the button is now square-shaped, instead of a circle. Maybe it fits with overall UI? I don&#8217;t really know.</p>
<p>Users also noticed a new slow motion feature, which works just like Samsung <a href="https://forum.xda-developers.com/galaxy-s9">Galaxy S9</a>. It starts recording slow motion video as soon as it detects movement. It&#8217;s worth noting that <a href="https://www.xda-developers.com/huawei-p20-pro-super-slow-motion-samsung-galaxy-s9/">we noticed that S9-like slow motion was coming back in March</a>. Here is it in action, courtesy of XDA Senior Member <a href="https://forum.xda-developers.com/member.php?u=2555881">mmeidl78:</a></p>
<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/BkLXbtWDPvF/" data-instgrm-version="8" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
<div style="padding:8px;">
<div style=" background:#F8F8F8; line-height:0; margin-top:40px; padding:50.0% 0; text-align:center; width:100%;">
<div style=" background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURczMzPf399fX1+bm5mzY9AMAAADiSURBVDjLvZXbEsMgCES5/P8/t9FuRVCRmU73JWlzosgSIIZURCjo/ad+EQJJB4Hv8BFt+IDpQoCx1wjOSBFhh2XssxEIYn3ulI/6MNReE07UIWJEv8UEOWDS88LY97kqyTliJKKtuYBbruAyVh5wOHiXmpi5we58Ek028czwyuQdLKPG1Bkb4NnM+VeAnfHqn1k4+GPT6uGQcvu2h2OVuIf/gWUFyy8OWEpdyZSa3aVCqpVoVvzZZ2VTnn2wU8qzVjDDetO90GSy9mVLqtgYSy231MxrY6I2gGqjrTY0L8fxCxfCBbhWrsYYAAAAAElFTkSuQmCC); display:block; height:44px; margin:0 auto -44px; position:relative; top:-22px; width:44px;"></div>
</div>
<p style=" margin:8px 0 0 0; padding:0 4px;"> <a href="https://www.instagram.com/p/BkLXbtWDPvF/" style=" color:#000; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none; word-wrap:break-word;" target="_blank">Neues Update des #Huawei #p20pro ist NICE! Verbesserungen in der Kamera-App incoming! #slowmo und #zoom</a></p>
<p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">A post shared by <a href="https://www.instagram.com/mmeidl78/" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px;" target="_blank"> Michael Meidl</a> (@mmeidl78) on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;" datetime="2018-06-18T19:24:15+00:00">Jun 18, 2018 at 12:24pm PDT</time></p>
</div>
</blockquote>
<p><script async defer src="//www.instagram.com/embed.js"></script></p>
<p>XDA Forum member tamaskurti also provided the official changelog:</p>
<p>&#8220;This update optimizes system performance and stability.</p>
<ul>
<li>Optimizes power consumption for longer usage.</li>
<li>Improves system performance and stability for smoother operations.</li>
<li>Optimizes the wallpaper display for a better experience.</li>
<li>Fixes an issue where the other party&#8217;s voice was occasionally delayed when answering calls while using OK Google.&#8221;</li>
</ul>
<p>As you see, the changes I&#8217;ve explained above aren&#8217;t even mentioned in an official changelog, which is a bit strange, but it&#8217;s a common practice for Huawei already. Nevertheless, this is definitely a welcome update as it contains some new features while improving stability and security. The update will roll out gradually and it will be available on every Huawei P20 Pro soon.</p>
<hr />
<a href="https://forum.xda-developers.com/huawei-p20-pro/how-to/clt-l29c432b131-firmware-improvements-t3804068" class="btn btn_" target="_self" style="background-color:#f85050; color:#ffffff;">Source: Huawei P20 Pro XDA Forum</a>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/huawei-p20-pro-update-960fps-slow-motion/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
		<item>
		<title>Xiaomi Mi Pad 4 is official with an 8-inch display and Snapdragon 660</title>
		<link>https://www.xda-developers.com/xiaomi-mi-pad-4-official-specifications-features/</link>
		<comments>https://www.xda-developers.com/xiaomi-mi-pad-4-official-specifications-features/#respond</comments>
		<pubDate>Mon, 25 Jun 2018 13:40:47 +0000</pubDate>
		<dc:creator><![CDATA[Idrees Patel]]></dc:creator>
				<category><![CDATA[Full XDA]]></category>
		<category><![CDATA[News]]></category>
		<category><![CDATA[XDA Android]]></category>
		<category><![CDATA[XDA Feature]]></category>
		<category><![CDATA[MIUI]]></category>
		<category><![CDATA[xiaomi]]></category>
		<category><![CDATA[Xiaomi Mi Pad 4]]></category>

		<guid isPermaLink="false">https://www.xda-developers.com/?p=222955</guid>
		<description><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/Xiaomi-Mi-Pad-4-Feature-Image-150x150.jpg" class="webfeedsFeaturedVisual wp-post-image" alt="Xiaomi Mi Pad 4" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" />Android tablets may well face a general decline in demand, but clearly, that hasn&#8217;t stopped Xiaomi from releasing a new Android tablet. The company&#8217;s Mi Pad series of tablets are some of the few Android tablets that are worth recommending because of their respectable specifications and affordable prices, at a time when most Android tablets]]></description>
				<content:encoded><![CDATA[<img width="150" height="150" src="https://www1-lw.xda-cdn.com/files/2018/06/Xiaomi-Mi-Pad-4-Feature-Image-150x150.jpg" class="webfeedsFeaturedVisual wp-post-image" alt="Xiaomi Mi Pad 4" style="display: block; margin-bottom: 5px; clear:both;max-width: 100%;" /><p class="dropcap">Android tablets <a href="https://www.xda-developers.com/idc-q3-2017-tablet-market-decline/">may well face a general decline in demand</a>, but clearly, that hasn&#8217;t stopped Xiaomi from releasing a new Android tablet. The company&#8217;s Mi Pad series of tablets are some of the few Android tablets that are worth recommending because of their respectable specifications and affordable prices, at a time when most Android tablets have outdated specifications.</p>
<p>The <a href="https://www.xda-developers.com/xiaomi-quietly-launches-the-mi-pad-3-with-a-7-9-display-and-mediatek-mt8176-soc/"><a href="https://forum.xda-developers.com/t/mi-pad-3">Xiaomi Mi Pad 3</a></a> was released back in April 2017 with the MediaTek MT8176 SoC. <a href="https://www.xda-developers.com/xiaomi-mi-pad-4-specifications/">We have exclusively reported some of the specifications of its successor</a>, and Xiaomi has now officially launched it alongside the <a href="https://www.xda-developers.com/xiaomi-redmi-6-pro-official-specifications-features/">Xiaomi Redmi 6 Pro</a>.</p>
<p>The Xiaomi Mi Pad 4 is not a typical cheap Android tablet. It has a high-resolution display, a capable SoC in the form of the <a href="https://www.xda-developers.com/tag/qualcomm-snapdragon-660/">Snapdragon 660</a>, and metal unibody construction. Let&#8217;s take a look at its specifications:</p>
<h2>Xiaomi Mi Pad 4 &#8211; Specifications at a glance</h2>
<p><img class="aligncenter size-full wp-image-222983" src="https://www1-lw.xda-cdn.com/files/2018/06/Xiaomi-Mi-Pad-4-Rose-Gold.jpg" alt="Xiaomi Mi Pad 4" width="728" height="313" srcset="https://www1-lw.xda-cdn.com/files/2018/06/Xiaomi-Mi-Pad-4-Rose-Gold.jpg 728w, https://www1-lw.xda-cdn.com/files/2018/06/Xiaomi-Mi-Pad-4-Rose-Gold-300x129.jpg 300w" sizes="(max-width: 728px) 100vw, 728px" /></p>
<table class="table_orange">
<thead>
<tr>
<th>Xiaomi Mi Pad 4</th>
<th>Specifications</th>
</tr>
</thead>
<tbody>
<tr>
<td>Dimensions and weight</td>
<td>200.2 x 120.3 x 7.9 mm, 342.5g</td>
</tr>
<tr>
<td>Software</td>
<td><a href="https://www.xda-developers.com/tag/miui/">MIUI</a> 9 on top of <a href="https://www.xda-developers.com/tag/android-oreo/">Android 8.1</a> Oreo</td>
</tr>
<tr>
<td>CPU</td>
<td>Octa-core Qualcomm Snapdragon 660 (4x Kryo 260 Performance cores clocked at 2.0GHz + 4x Kryo 260 Efficiency cores clocked at 1.8GHz)</td>
</tr>
<tr>
<td>GPU</td>
<td>Adreno 512</td>
</tr>
<tr>
<td>RAM and storage</td>
<td>3GB of RAM with 32GB of storage / 4GB of RAM with 64GB of storage; dedicated microSD card slot</td>
</tr>
<tr>
<td>Battery</td>
<td>6000mAh, 5V/2A charging)</td>
</tr>
<tr>
<td>Display</td>
<td>8-inch WUXGA (1920&#215;1200) IPS LCD with a 16:10 aspect ratio</td>
</tr>
<tr>
<td>Wi-Fi</td>
<td>802.11ac</td>
</tr>
<tr>
<td>Bluetooth</td>
<td>Bluetooth 5.0</td>
</tr>
<tr>
<td>Ports</td>
<td>USB Type-C port, 3.5mm headphone jack; LTE version: Nano SIM slot</td>
</tr>
<tr>
<td>Bands</td>
<td>LTE version:<br />
FDD-LTE: Bands 1/3/5/7/8<br />
TDD-LTE: Bands 34/38/39/40/41</td>
</tr>
<tr>
<td>Rear camera</td>
<td>13MP camera with f/2.0 aperture<br />
Video recording up to 1080p at 30fps</td>
</tr>
<tr>
<td>Front-facing camera</td>
<td>5MP front-facing camera</td>
</tr>
</tbody>
</table>
<p>The Mi Pad 4 has metal unibody construction, which instantly gives it a more premium look and feel than most budget Android tablets. The tablet has relatively small bezels, and Xiaomi is promoting how it can be used with one hand. The display&#8217;s 16:10 aspect ratio also helps in this respect.</p>
<h2>Performance</h2>
<p>The Xiaomi Mi Pad 4 is powered by the Qualcomm Snapdragon 660 system-on-chip. The SoC has four big cores in the form of the Kryo 260 Performance (based on Arm Cortex-A73) clocked at 2.0GHz (downlocked in the Mi Pad 4), paired with four Kryo 260 Efficiency (Cortex-A53) cores clocked at 1.8GHz. The Snapdragon 660 uses the Adreno 512 GPU, which is more powerful than the Adreno 509 of the Snapdragon 636.</p>
<p>The tablet comes in two variants: 3GB of RAM with 32GB of storage, and 4GB of RAM with 64GB of storage. The storage is expandable via microSD card slot.</p>
<h2>Display</h2>
<p>The Mi Pad 4 has an 8-inch WUXGA (1920&#215;1200) IPS LCD with a 16:10 aspect ratio. The display&#8217;s aspect ratio and resolution are different from its predecessors. Technically, the Mi Pad 4 features a lower resolution display than the Mi Pad 3 and the Mi Pad 2. The move to a 16:10 aspect ratio from a 4:3 aspect ratio may also be thought of as a downgrade for productivity tasks, but opinions on this can vary.</p>
<h2>Connectivity</h2>
<p>The tablet is powered by a 6000mAh battery with regular 10W charging. It has Wi-Fi 802.11b/g/n/ac, and Bluetooth 5.0, a USB Type-C port, and a 3.5mm headphone jack.</p>
<h2>Software</h2>
<p>The Xiaomi Mi Pad 4 is powered by MIUI 9 on top of Android 8.1 Oreo, which means that it&#8217;s required to have <a href="https://forum.xda-developers.com/project-treble">Project Treble</a> support.</p>
<h2>Xiaomi Mi Pad 4 &#8211; Pricing and availability</h2>
<p>The Xiaomi Mi Pad 4 is available in Black and Rose Gold colors. Pre-orders for the device have gone live in China, with availability scheduled for June 29. The 3GB RAM/32GB storage variant costs CNY 1099 ($170), while the 4GB RAM/64GB storage variant costs CNY 1399 ($215). The LTE variant costs CNY 1499 ($230).</p>
<p><strong>Let us know what you think about the Xiaomi Mi Pad 4 in the comments below.</strong></p>
<p class="clear:both;">
]]></content:encoded>
			<wfw:commentRss>https://www.xda-developers.com/xiaomi-mi-pad-4-official-specifications-features/feed/</wfw:commentRss>
		<slash:comments>0</slash:comments>
		</item>
	</channel>
</rss>

<!--
Performance optimized by W3 Total Cache. Learn more: https://www.w3-edge.com/products/

Object Caching 239/1144 objects using memcached
Content Delivery Network via www1-lw.xda-cdn.com
Minified using memcached

Served from: www.xda-developers.com @ 2018-07-02 12:36:24 by W3 Total Cache
-->