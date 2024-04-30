

let runCodeGeneration = false;


const documentResult = {
    title: '',
    chapters: [
        //{ title: 'TITLE', prompt_add: 'ein knackiger Titel mit max. 30 Zeichen', content: '' },
        {
            title: 'Einführung',
            prompt_add: 'Ich möchte eine Dokumentation für eine IT Lösung erstellen. Du sollst  dafür ein Kapitel mit der Überschrift "Einführung" mit Ihnalt füllen. ' +
                        'Dieses Kapitel soll kurz beschreibung, um was es bei der Lösung geht, deren Nutzen, Ziele und die entsprechende Zielgruppe.' +
                        'Bitte fasse dich dabei kurz und deutlich. Es soll 1 Absatz zwischen 50 und 75 Wörtern sein. Es soll keine Technische Beschreibung darin enthalten sein. Keine Beschreibung der Funktionen oder sowas. Nur Der Sinn und Zweck der Lösung.',
            content: '' },
        {
            title: 'Motivation',
            prompt_add: 'Ich möchte eine Dokumentation für eine IT Lösung erstellen. Du sollst  dafür ein Kapitel mit der Überschrift "Motivation" mit Ihnalt füllen. ' +
                'Dieses Kapitel soll kurz beschreibung, warum das ganze Vorhaben entstanden ist, und evtl. welches Problem dadurch gelöst werden kann.' +
                'Bitte fasse dich dabei kurz und deutlich. Es soll 1 bis 2 Absätze zwischen 50 und 100 Wörtern sein. Es soll keine Technische Beschreibung darin enthalten sein. Keine Beschreibung der Funktionen oder sowas. Nur die Motivation und Beweggründe hinter der Lösung. Bitte keinen zusätzlichen Titiel erstellen. nur fließtext.',
            content: '' },
        {
            title: 'Funktionalität',
            prompt_add: 'Ich möchte eine Dokumentation für eine IT Lösung erstellen. Du sollst  dafür ein Kapitel mit der Überschrift "Funktionalität" mit Ihnalt füllen. ' +
                'Dieses Kapitel soll verschiedene Fähigkeiten der Anwendung mit je einer kurzen Beschreibung auflisten. Was kann die jeweilige Funktion Leisten und welchen Nutzten hat sie. ' +
                'Bitte fasse dich dabei kurz und deutlich. Es sollen ca. 5 Absätze mit je maximal 20 Wörtern sein. Es soll keine detailierte Technische Beschreibung darin enthalten sein. Keine Beschreibung der Methoden und Parameter. ',
            content: '' },
        {
            title: 'Architektur',
            prompt_add: 'Ich möchte eine Dokumentation für eine IT Lösung erstellen. Du sollst  dafür ein Kapitel mit der Überschrift "Architektur" mit Ihnalt füllen. ' +
                'Dieses Kapitel soll kurz beschreibung, wie die Basisarchitektur aussieht. Außerdem soll der verwendete Technologie Stack beschrieben werden. ' +
                'Hier sind Code Beispiele aus denen Du den entsprechenden Tech-Stack, bestehend aus Programmiersprachen, Frameworks, Libs und Drittsystemen ableiten sollst:' +
                '[CODE]' +
                'Bitte fasse dich dabei kurz und deutlich. Es sollen 2 Absätze zwischen 50 und 100 Wörtern sein. Keine Beschreibung der Funktionen und Parametern oder sowas. Bitte keinen zusätzlichen Titiel erstellen.',
            content: '' },
        {
            title: 'Zusammenfassung',
            prompt_add: 'Ich möchte eine Dokumentation für eine IT Lösung erstellen. Du sollst  dafür ein Kapitel mit der Überschrift "Zusammenfassung" mit Ihnalt füllen. ' +
                'Dieses Kapitel soll einen Fazit ziehen, warum das eine gute Lösung ist und deren Nutzten nochmal kurz und prägnant verdeutlichen.' +
                'Bitte fasse dich dabei kurz und deutlich. Es soll 1 Absatz zwischen 50 und 75 Wörtern sein. Es soll keine Technische Beschreibung darin enthalten sein. Keine Beschreibung der Funktionen und Parameter oder sowas. Nur ein Fazit.',
            content: '' },
    ]};





function setResultDoc(show){
    const res = document.getElementById('resultDoc');

    res.style.display = show? 'flex' : 'none';
}

function setResult(text){
    const res = document.getElementById('result');

    res.innerText = res.innerText + '\n\n' + text;
}

function setCode(text){
    const taCode = document.getElementById('plain_code');

    taCode.value = text;
}

function showLoader(on){
    document.getElementById('loader').style.display = on ? 'block' : 'none';
}


function generateDocs(val, onComplete){
    console.log('generate docs', val);

    //setResult('');
    showLoader(true);

    fetch(
        'http://localhost:3002/api/docthis',
        {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
              value: val,
              context: document.getElementById('context').value
            }),
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    ).then(res => res.json())
     .then(res => {
        console.log('response:', res)

        setResult(res.data);
        showLoader(false);

        if (onComplete) onComplete();

    }).catch(
        err => {
            console.error(err);
            showLoader(false);
        }
    )

}


function generateChapter(chapter, onComplete){
    showLoader(true);

    fetch(
        'http://localhost:3002/api/docchapter',
        {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
                chapter: chapter,
                content: document.getElementById('result').innerText,
                context: document.getElementById('context').value
            }),
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    ).then(res => res.json())
        .then(res => {
            //console.log('chapter response:', res);

            //setResult(res.data);
            showLoader(false);

            if (onComplete) onComplete(res.data);

        }).catch(
        err => {
            console.error(err);
            showLoader(false);
        }
    )

}


function loadCode(repo){
    console.log('load code', repo);

    fetch(
        'http://localhost:3002/api/repo?repo=' + repo,
        {
            method: 'GET',
            redirect: 'follow',
            headers:{ 'Content-Type': 'application/json', 'Accept': 'application/json' }
        }
    ).then(res => res.json())
     .then(res => {
        console.log('response:', res)

        runCodeGeneration = true;
        processCodeGeneration(res.data, 0);
        createFileList(res.data);

     }).catch( err => { console.error(err); } )
}



function processCodeGeneration(codes, i) {
    if (runCodeGeneration && i < codes.length) {
        console.log('process: ' + i + ' code:', codes[i]);
        setActiveInFileList(i);
        setCode(codes[i].code);
        generateDocs(codes[i].code, () => {
            console.log('docs generation complete.');
            processCodeGeneration(codes, i+1);
        });
    }


}



function startDocGeneration() {
    generateTitle((r) => {
        document.getElementById('title').innerText = r.trim().replaceAll("\"", "");

        documentResult.title = r.trim().replaceAll("\"", "");

        processDocumentGeneration(0);
    });
}

function processDocumentGeneration(i) {

    if (i < documentResult.chapters.length) {
        setResultDoc(true);
        const chapterPrompt = documentResult.chapters[i].prompt_add.replace('[CODE]', document.getElementById('plain_code').value);


        generateChapter(chapterPrompt, (r) => {
            console.log('chapter result', r);
            document.getElementById('ch' + (i+1)).innerText = r;
            documentResult.chapters[i].content = r;

            if (documentResult.chapters[i].title == 'Architektur') {
                appendDiagram(r);
            }

            document.getElementById('ttl' + (i+1)).scrollIntoView({
                behavior: "smooth"
            });

            processDocumentGeneration(i + 1);
        });
    }
}

function generateTitle(onComplete){
    showLoader(true);

    fetch(
        'http://localhost:3002/api/prompt',
        {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
                prompt: "Ich möchte eine Dokumentation einer IT Lösung erstellen. Kannste mir einen knackigen Titel und zwar nur den Titel ohne alternativen usw. mit max. 35 Zeichen erstelen. Hier ist der Content zu dem der Titel erstellt werden soll:",
                content: document.getElementById('result').innerText
            }),
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    ).then(res => res.json())
        .then(res => {
            //console.log('chapter response:', res);

            //setResult(res.data);
            showLoader(false);

            if (onComplete) onComplete(res.data);

        }).catch(
        err => {
            console.error(err);
            showLoader(false);
        }
    )
}

function generateMermaidDiagram(cnt, onComplete){
    showLoader(true);

    fetch(
        'http://localhost:3002/api/prompt',
        {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
                prompt: "ich möchte in Mermaid syntax ein ER Diagramm erstellen. Kannste bitte nur den Mermaid Code zurück liefern und keine Beschreibung! Auch bitte keine mermaid block definition sondern nur den code nackten Code von mermaid. Folgende Architektur liegt zugrunde:",
                content: cnt
            }),
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    ).then(res => res.json())
        .then(res => {
            showLoader(false);

            if (onComplete) onComplete(res.data);

        }).catch(
        err => {
            console.error(err);
            showLoader(false);
        }
    )
}

function stopCodeGeneration(){
    runCodeGeneration = false;
}

function setActiveInFileList(i) {
    let listItems = document.querySelectorAll('#filesUL li');

    for(let x=0; x < listItems.length; x++) {
        if (x == i) {
            listItems[x].classList.add('active');

            listItems[x].scrollIntoView({
                behavior: "smooth"
            });

        } else {
            listItems[x].classList.remove('active');
        }
    }
}

function createFileList(codes) {
    let html = '';

    codes.forEach(c => {
        html += `<li>${c.name.split('\\').pop()}</li>`;
    })

    document.getElementById('filesUL').innerHTML = html;
}


async function createPDF(){
    const doc = new window.jspdf.jsPDF('p', 'mm', 'a4');

    console.log('pdf', doc);


    await convetToPDF(doc);

}


async function convetToPDF(doc){

    //const doc = new jsPDF('p', 'mm', 'a4');

    //cover
    doc.setFont("MBCorpo Title", "Bold");
    //doc.addImage(img, 'PNG', 95, 50, 18, 16 );


    doc.setFontSize(24);
    doc.text(documentResult.title,  105, 100, {align: "center"}) ;
    doc.setFontSize(11).setTextColor('#888');

    var formattedDate = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });


    doc.text(formattedDate  + ", Projekt Dokumentation.",  105, 110, {align: "center"}) ;
    doc.setFontSize(12).setTextColor('#555');
    doc.text("created by code2doc Ai-Assistant",  105, 120, {align: "center"}) ;


    doc.setFontSize(10).setTextColor('#888');
    //doc.text("powered by Mecedes-Benz Tech Innovation GmbH",  105, 290, {align: "center"}) ;



    //toc
    doc.addPage();
    doc.setFont("MBCorpo Title", "Bold")
        .setFontSize(20).setTextColor('#000')
    doc.text("Inhaltsverzeichnis",  105, 30, {align: "center"}) ;
    let x= 1;
    let y = 60;


    for(let c of documentResult.chapters) {
        doc.setFontSize(14);
        doc.text(`${x}. ${c.title}`, 20, y);
        doc.setTextColor('#555').setFontSize(10);
        doc.text('.  '.repeat(40), 180, y, {align: "right"});
        doc.setTextColor('#000').setFontSize(11);
        doc.text(` S. ${x++}`, 190, y, {align: "right"});

        doc.link(20, y-9, 190, 9, {url: '#page=' + x});
        y += 9;
    }



    // content
    doc.addPage();


    for(let c of documentResult.chapters) {
        let yPpos = 30;
        const indx = documentResult.chapters.indexOf(c);

        doc.setFont("MBCorpo Title", "Bold");
        doc.setFontSize(16);

        doc.text( `${indx+1}. ${c.title}`, 20, yPpos);


        if (c.title == 'Architektur') {
            yPpos += 20;

            const rectWidth = doc.internal.pageSize.getWidth() - 40;
            const rectHeight = 100;

            const imgArch = await exportToDataURL(rectWidth, rectHeight);

            console.log('imgArch', imgArch)

            doc.addImage(imgArch.img, 'PNG', 20, yPpos, imgArch.width, imgArch.height);

            yPpos += imgArch.height;
        }


        yPpos += 20;
        doc.setFont("MBCorpo Text", "Regular");
        doc.setFontSize(12);

        let splittedText = doc.splitTextToSize(c.content, doc.internal.pageSize.width-40);

        for(let l of splittedText){
            doc.text(l, 20, yPpos);
            yPpos += 7;
        }

        console.log(splittedText);
        doc.addPage();
    }


    doc.setFont("MBCorpo Title", "Bold");
    doc.setFontSize(16).setTextColor('#444');
    doc.text(this.document.title,  105, 110, {align: "center"}) ;
    doc.setFont("MBCorpo Text", "Regular");
    doc.setFontSize(11).setTextColor('#888')
    doc.text("created by code2docs Ai-Assistant.",  105, 120, {align: "center"});

    //doc.addImage(img, 'PNG', 95, 180, 18, 16 );
    //doc.html(this.docElm.nativeElement.innerHTML)

    doc.save(documentResult.title.replaceAll(" ", '_') + ".pdf");
}

async function appendDiagram(cnt) {

    generateMermaidDiagram(cnt, async (r) => {
        const element = document.querySelector('#diagramContainer');
        const mermaidCode = `
    %%{init: {"theme": "dark" }}%%
                        ${r.replaceAll('```', '').replaceAll('mermaid', '')}
        `;

        console.log('container: ', element);
        const { svg } = await window.mermaid.mermaidAPI.render('diagramContainer2', mermaidCode);

        console.log('svg: ', svg);
        element.innerHTML = svg;
    });
}

async function exportToDataURL(widht, height){
    const scaleValue = 10;

    const svgElement = document.querySelector('#diagramContainer svg');
    //console.log(svgElement);

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const base64Data = btoa(svgString);
    const dataURL = 'data:image/svg+xml;base64,' + base64Data;

    const img = new Image();
    img.src = dataURL;

    const imageLoaded = new Promise(resolve => {
        img.onload = resolve;
    });

    await imageLoaded;


    const iWidth = svgElement.width.baseVal.value;
    const iHight = svgElement.height.baseVal.value;

    const scaleFactor = Math.min(widht / iWidth, height / iHight);


    const scaledWidth = iWidth * scaleFactor;
    const scaledHeight = iHight * scaleFactor;



    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = scaledWidth * scaleValue; //svgElement.width.baseVal.value;
    canvas.height = scaledHeight * scaleValue;  //svgElement.height.baseVal.value;

    console.log(`w: ${canvas.width}  h: ${canvas.height}`);

    context.drawImage(img, 0, 0);

    return {
        img: canvas.toDataURL('image/png'),
        width: canvas.width / scaleValue,
        height: canvas.height / scaleValue
    }


    //return dataURL;





    // const downloadLink = document.createElement('a');
    // downloadLink.href = dataURL;
    // downloadLink.download = 'image.svg'; // Dateiname für den Download
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);

}

const img = `data:image/png;base64,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`;
