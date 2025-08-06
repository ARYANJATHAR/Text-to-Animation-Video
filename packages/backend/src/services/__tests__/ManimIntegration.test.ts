import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RemotionServiceImpl } from '../remotion.service';
import { ManimServiceImpl } from '../manim.service';
import type { AnimationPlan } from 'shared-types';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Manim Integration with Remotion Service', () => {
  let remotionService: RemotionServiceImpl;
  let manimService: ManimServiceImpl;

  beforeEach(() => {
    remotionService = new RemotionServiceImpl();
    manimService = new ManimServiceImpl();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Single Manim Segment Integration', () => {
    it('should integrate a single Manim segment successfully', async () => {
      const mockSegment = {
        id: 'test-segment-1',
        videoSegment: {
          id: 'video-1',
          filePath: '/test/output/video1.mp4',
          duration: 10,
          resolution: { width: 1920, height: 1080 },
          format: 'mp4',
          startTime: 0,
          endTime: 10
        },
        metadata: {
          sceneCount: 2,
          objectCount: 5,
          animationCount: 3,
          complexity: 'moderate',
          renderTime: 15
        },
        integrationPoints: [
          {
            id: 'start-point',
            timestamp: 0,
            type: 'sync',
            properties: { event: 'segment_start' }
          }
        ]
      };

      const result = await remotionService.integrateManimSegment(mockSegment);

      expect(result.integrated).toBe(true);
      expect(result.segmentId).toBe('test-segment-1');
      expect(result.component).toBeDefined();
      expect(result.component.type).toBe('manim');
      expect(result.component.props.src).toBe('/test/output/video1.mp4');
      expect(result.timing.duration).toBe(10);
      expect(result.metadata.complexity).toBe('moderate');
    });

    it('should handle invalid segment data', async () => {
      const invalidSegment = {
        id: 'invalid-segment',
        // Missing videoSegment
        metadata: {},
        integrationPoints: []
      };

      await expect(
        remotionService.integrateManimSegment(invalidSegment)
      ).rejects.toThrow('Invalid Manim segment: missing video file path');
    });

    it('should convert timing correctly to frames', async () => {
      const segment = {
        id: 'timing-test',
        videoSegment: {
          id: 'video-timing',
          filePath: '/test/timing.mp4',
          duration: 5.5, // 5.5 ;})
  });
  });tly
  ciend group effi; // Shoulnts.length)ppingSegmeThan(overla).toBeLessxLayerIndex(ma expect     dex));
erIn => lc.layp((lc: any)itions.mapost.layerComresulx(....ma= MathrIndex onst maxLaye   ctly
   efficients egmening sverlappuld group oSho    //         
n(0);
reaterThath).toBeGitions.lengost.layerComp(resulect     expThan(0);
 erreateGh).toBicts.lengtconflresult.expect(  ue);
    toBe(trated).egrult.intxpect(res

      ene); timelints,gmerlappingSets(oveimSegmenMultipleManratece.integotionServiem rwait result = a    const  ));

[]
      }imations:     an    {} },
 , data:: 'diagram'typentent: {    co    ,
 s const: 'manim' agyhnoloec    t
    .duration,egmentn: s.videoSuratio d     
  artTime,ment.stegs.videoStartTime:    s,
     .id     id: s
   > ({p(s =mas.entgSegminlapp = overt timeline    cons      }));


  ts: []tionPoingrante,
        i    }
    erTime: 5  rend       'simple',
 lexity:    comp
       : 1,nCount  animatio     
   ctCount: 1, obje    ,
     nt: 1Coucene         sadata: {
     met
    
        },) + 10me: (i * 0.5   endTi      overlap
  avy // He 0.5,e: i *startTim
           'mp4',format:       080 },
   : 1920, heightth: 1: { widtionolu res     n: 10,
    uratio     d`,
     p${i}.mp4la/test/overlePath: `  fi`,
        {i}erlap-$video-ovd: `   i{
       t:  videoSegmen   `,
    ${i}p-la `over       id:i) => ({
 0 }, (_,  2th:m({ leng.frorayts = ArenppingSegmconst overla
       segmentsoverlapping Create 20     // {
   =>sync ()', amentsrlapping seg many ove forpositionse layer comd optimiz'shoul;

    it(
    })conds within 2 secompleteShould / ); /an(2000LessTh).toBesingTimeesct(proc
      expe(100);ngthts).toHaveLeenonresult.comp   expect(;
   ).toBe(true)t.integratedexpect(resul      ;

- startTimendTime  ee =cessingTimro  const p
    (); Date.nowme =Ticonst end      
      
eline); timts,ments(segmenpleManimSegtintegrateMulvice.imotionSerit relt = awaconst resu

      ); })[]
     animations: ,
         data: {} }gram',{ type: 'dia content:        const,
manim' as nology: '    tech   ion,
 ent.durateoSegmn: s.vidatio    dure,
    rtTimt.stavideoSegmene: s. startTim       d,
 s.i     id:=> ({
   nts.map(s egmetimeline = sconst    ;

         }))oints: []
tionP integra       },
    3
    rTime:        rende',
   'simplemplexity: co       unt: 1,
   nCo animatio      2,
   nt: ectCou  obj      
  unt: 1,  sceneCo  {
       metadata:    
            },i + 1) * 3
 (endTime:         * 3,
 artTime: i    st      ,
 at: 'mp4'        form  },
0 08 height: 1: 1920, { widtholution:      res   
 ration: 3,          dup4`,
.mvideo${i}t/ath: `/tes       fileP
   `,{i}`video-$:           id{
t: oSegmen    vide${i}`,
    egment-   id: `s
     ({_, i) => , (ength: 100 }y.from({ lraArs = nst segment    cots
  engme 100 se    // Creat
  ;
      now()e = Date.im startTconst      nc () => {
ly', asycients effi of segmentumbers large nd handleulsho    it('=> {
y', () litand Scalabice manribe('Perfor
  desc;
  });
  })
  toBe(0);rames).nFt.durationIt.componenect(resulxp);
      etoBe(truetegrated).ct(result.inxpe;

      etionSegment)eroDuraegment(zanimSteMegrantrvice.ionSeawait remoti = t result cons     

};: []
      tsgrationPoin   inte  },
     
      me: 0  renderTi     mple',
   xity: 'sile   comp 0,
       ount:ionC   animat 0,
       Count:ctje       ob
   Count: 0, scene        adata: {
 
        met,   } 0
     endTime:     0,
      artTime:         stt: 'mp4',
      forma    },
  ht: 108020, heig 19dth: { wisolution:          re 0,
 duration:      ',
   /zero.mp4stlePath: '/te       fizero',
   deo-viid: '       
   gment: {eoSe vid      ment',
 'zero-seg      id: ent = {
  ionSegm zeroDurat    const
  nc () => {ion', asyro duratnts with zee segmed handl'shoulit(       });

 mes
 3 fra30fps = // 0.1 * Be(3);s).toionInFrameonent.duratresult.comp   expect();
   oBe(0.1.tng.duration)miesult.tipect(rex     );
 d).toBe(truentegrateect(result.ixp;

      egment)Seent(shortanimSegmteMgratee.inicrv remotionSe = awaitltnst resu
      co      };
oints: []
ionPgratnte     i
           },e: 1
nderTim          re',
: 'simpleexity     compl   1,
  tionCount:  anima
         ctCount: 1,   obje     1,
   eneCount:    sc    adata: {
       met   
    },   0.1
  endTime:  ,
        Time: 0      start'mp4',
    format:         0 },
  ght: 108 1920, heiidth:{ wlution: eso    r    ation
  short dur.1, // Very tion: 0  dura       ',
 t/short.mp4es '/tfilePath:      ,
    rt': 'video-sho   id    : {
   ment   videoSegnt',
     ort-segmed: 'sh      iment = {
  ortSeg    const sh{
  sync () => ments', a short segrye ved handl it('shoul   );

  }ch
  matne meli // No ti0);oHaveLength(onPoints).tizationynchr(result.spect     ex
 ength(1);nts).toHaveLlt.compone expect(resu     oBe(true);
tegrated).tesult.in  expect(r    
line);
yTime], emptegmentents([seManimSegmtipleMulgratteervice.inotionS= await remt resulonst 
      c];
] = [line: any[imest emptyT con};

     
      nPoints: []gratiointe},
        
         5 renderTime:
         mple',lexity: 'si  comp        
t: 1,nCoun    animatio    t: 1,
  objectCoun         : 1,
 Countcene      s
    ta: {metada             },
5
   e:       endTim  me: 0,
       startTi     t: 'mp4',
  forma     },
     1080ight:0, he92 { width: 1olution:       reson: 5,
      durati    mp4',
   est/orphan.th: '/t  filePa      ,
  phan''video-or id:          Segment: {
  video     nt',
 -segmeid: 'orphan        nt = {
gmeconst se{
      c () => syn', atriesline enching timewithout mategments d handle sul it('sho

   ;
    });ts).toBe(0).totalSegmenxpect(result0);
      eoHaveLength(onflicts).tect(result.c exp    th(0);
 oHaveLengionPoints).tonizatsult.synchr   expect(re
   th(0);).toHaveLengmponentst(result.coec   exp
   ;Be(true)ted).tograteresult.inpect(      ex

], []);nts([mSegmeaniltipleMgrateMuinteionService.wait remotult = a resonst      c () => {
', asyncts arrayempty segmene  handlouldit('sh=> {
    () dge Cases', ndling and E'Error Ha describe(

  });
  });
   );remotion'('taines).toConrvic.seartSync?  expect(st  ;
  m')ain('maniices).toContrvc?.seartSynexpect(st   ;
   ).toBe(15).timestampdSync?ect(en     exp
 mp).toBe(5);.timestac?(startSyn     expect   );

    ent_end'
gm=== 'sent eve    sp.    => 
p: any) ind((snPoints.fchronizatio.synesultync = rt endS
      cons'
      );_startsegment= 'ent ==      sp.ev
  y) => (sp: anfind(ints.ionPozatonit.synchrnc = resulstartSy  const      
    gth(2);
 s).toHaveLentionPointynchronizat(result.s    expec;

  ne)imeli[segment], tnts(SegmeipleManimgrateMultinteice.rvSemotionrelt = await t resu      cons    ];

     }
   []
   s:  animation      ,
  a: {} }dat', am'diagr: { type: content       st,
   anim' as conhnology: 'm      tec
    n: 10,ratio        duime: 5,
       startT
     'sync-test',:   id
              { [
  ine =t timel     cons };

 
     ts: []tionPoinegra
        int},10
        ime:   renderT,
        te'ty: 'modera   complexi,
       ionCount: 1    animat: 1,
      jectCount   ob,
       eCount: 1ensc      a: {
    metadat,
             }5
   Time: 1      end    5,
tTime: star
          p4',mat: 'm       for080 },
   height: 120,  19 width:lution: { reso         0,
on: 1 durati
         sync.mp4',: '/test/  filePath   
     nc',sy 'video-   id:   nt: {
    me   videoSegest',
      'sync-t        id:egment = {
 s
      const => {, async ()rectly' points corionatronizynche satgenerhould   it('s);

  .0);
    }Than(1esscity).toBeLopar?.lexLaye(comp expect    );
 ssThan(1.0LeBe).toer?.opacitypleLayimxpect(s     eg layers
 infor overlapped reduc is ity opacckhe   // C
   
      );erlay'('ovode).toBeayer?.blendMplexLxpect(com');
      ee('normalode).toBr?.blendMyeimpleLaect(s exp    
     );
')
  yer-2ludes('la   lc.id.inc    ) => 
 c: anyions.find((lCompositult.layer = reslexLayernst comp    co);
  )
      -1'des('layerd.inclu lc.i       
: any) => .find((lcompositionssult.layerCleLayer = re  const simpxity
    plecomed on ssigned basre alend modes aheck b// C
      2);
      ngth(ns).toHaveLeompositiolt.layerCxpect(resu

      eeline);ts, timts(segmenmenManimSegrateMultipleegntervice.iremotionSt = await st resul
      con;
  }
      ]    ons: []
    animati         },
, data: {}ram' type: 'diagontent: {   c       const,
im' as manogy: 'nol   tech      
 n: 5, duratio      ime: 2,
   tartT      s    ,
: 'layer-2'id           {
       },
      []
    animations:        },
  {}m', data: pe: 'diagra{ tynt:       conteconst,
    'manim' as logy: chno          te5,
uration:        d0,
   ime:    startT
       ,er-1''lay       id:      {
     ne = [
  timeli
      const];
     }
   
      : []onPointsgrati    inte  ,
             }5
 nderTime: 2          re
  complex',y: 'exitmpl   co      nt: 8,
   nCou  animatio         
 : 10,ectCount         obj 2,
   ceneCount:           s
 {ata:     metad},
      
          ndTime: 7    eng
        riyes for laaprlOve/ me: 2, /    startTi',
        t: 'mp4 forma          80 },
 , height: 10th: 1920 widolution: {    res      5,
    duration:       .mp4',
    st/layer2'/teath:        fileP2',
      'video-        id:
    : {mentvideoSeg        r-2',
  aye 'l         id:{
 
        },
        nts: []ionPoi  integrat     },
             5
 e:Tim   render
         imple',exity: 's  compl         1,
  ationCount:     anim
       tCount: 2,   objec        nt: 1,
 ou     sceneC
       data: {       meta},
         5
    ime:       endT0,
      me: Tistart      ',
      mat: 'mp4  for       },
   ight: 1080 th: 1920, heid { w resolution:            5,
ation:      dur     .mp4',
 er1t/laytesfilePath: '/       ',
     d: 'video-1        i: {
    ment  videoSeg    ',
    'layer-1    id: 
      
        {ts = [gmen const se=> {
     () nc tions', asyayer composi lpriateroppuld create a    it('sho    });

han(0);
reaterTth).toBeGtions.lengrComposi(result.layexpect
      e;Be(true)aps).tosOverla.haetadatsult.mexpect(re      
erThan(0);BeGreat).toonrlapDuratioveflicts[0].(result.conxpect');
      eerlape('ov.toB0].type)t.conflicts[expect(resul  n(0);
    Thareaterngth).toBeG.leictst.conflct(resul expe);
     uetoBe(trntegrated).esult.ipect(r    ex

  );eline, timtspingSegments(overlapanimSegmenipleMteMulte.integrarvicremotionSe= await onst result 

      c  ];
         }s: []
     animation
        : {} },gram', datadia: { type: '   content        const,
im' asology: 'man    techn6,
      n: uratio   d,
       startTime: 5          ,
nt-2'd: 'segme      i
          {     },
  
   ] [ions:   animat       {} },
: ataagram', dpe: 'diontent: { ty   c,
       onstm' as c'maninology:   tech
        duration: 8,       ,
   startTime: 0     
     nt-1',segme       id: '     {
     eline = [
   const tim
       ];
  }
   []
      nPoints: tiora  integ  
          },      ime: 12
nderT       re,
     : 'moderate'omplexity c       : 3,
    ntonCou  animati
          ount: 5,jectC   ob,
         : 1untCo   scene  : {
           metadata
      },          dTime: 11
       en    gment-1
 h seerlaps witme: 5, // Ov     startTi       ',
at: 'mp4rm    fo        },
: 1080 ght heiidth: 1920,: { wsolution        re
    6,tion:       dura  p4',
    est/video2.m/tath: '    fileP        video-2',
 '      id:
      t: {eoSegmen       vidt-2',
   men    id: 'seg {
              },
]
       nts: [grationPoi        inte     },
  
     10ime:  renderT       mple',
    'sicomplexity:             nt: 2,
ationCouanim        
    unt: 3,objectCo        : 1,
      sceneCount
          : {   metadata
           },      ime: 8
        endT    e: 0,
tTim      star,
       'mp4'    format:
        ,1080 }: ght heidth: 1920,tion: { wi      resolu    ion: 8,
       durat
       mp4',video1.th: '/test/    filePa        1',
ideo-  id: 'v      t: {
    oSegmende        vi',
   'segment-1     id:
        {= [
     nts appingSegmerlonst ove
      c () => {ents', asyncing segmlappe over handlandtect uld de'sho    it( });


   Be(false);laps).toata.hasOveradsult.met expect(re    oBe(2);
 gments).totalSesult.txpect(res
      eap// No overlLength(0); icts).toHavefl(result.conpect  ex
    intsnd po+ 2 et 2 starth(4); // ).toHaveLengPointshronizationnct.sy(resul      expect2);
th(.toHaveLengcomponents)result.xpect( e     );
).toBe(truegrated.inteect(result      exp

imeline);, ttsents(segmeManimSegmeneMultipltegratvice.inotionSerremit wault = a const res
          ];
 }
 
       []ions: nimat
          a{} },ram', data: ag { type: 'dicontent:
          t,m' as consy: 'maniechnolog     t     ion: 7,
 durat  ,
       : 6startTime       
   nt-2', id: 'segme     {
           },
   ]
      tions: [nima    a     ,
  }, data: {}iagram': { type: 'd     content    s const,
 manim' ahnology: 'tec       
   uration: 5,        d 0,
  startTime:       
   1',ent-d: 'segm          i    {
  [
   timeline =    const   ];

   
    }      ints: []
 tegrationPo   in              },

   Time: 20er  rend       
   x','complecomplexity:           : 5,
  ionCountanimat         8,
   tCount: bjec        o: 2,
    ceneCount         s
    metadata: {
                 },
  ndTime: 13        eap
    o overl // N 6,Time:   start   4',
      rmat: 'mp  fo         
 080 },0, height: 1th: 192n: { widlutioso          re7,
  ion:       durat      2.mp4',
test/videofilePath: '/        2',
     'video-  id:
           {t:gmenvideoSe
          nt-2',: 'segme          id  {

            },ts: []
  grationPoin      inte},
       8
       : enderTime           r
 ple','simcomplexity:           2,
   onCount:mati         ani   ount: 3,
     objectC     t: 1,
  ceneCoun     s   
    metadata: {                },
: 5
    Time       end 0,
     tTime:        star
    'mp4',: atorm f  ,
         t: 1080 }0, heigh width: 192esolution: {       r     ion: 5,
at   dur        1.mp4',
 ideo: '/test/vePath       fil   ,
  d: 'video-1'     i   
    oSegment: {vide
          -1','segment        id:   {
        gments = [
    const se () => {
  , asyncsegments'apping non-overle multiple ntegratt('should i{
    iion', () => ntegratnts ISegmenim ple Matie('Mulrib

  desc;
  }); }) + 165
   60e(225); // .toBrame)ndFming.e(result.tipect
      extoBe(60);rame).startF.timing.ultxpect(res
      e5 framesconds = 16, 5.5 serames60 feconds =  30fps: 2 s // At

     t);gmengment(seeManimSee.integratmotionServict = await resulre   const        };

 
 oints: []rationP      integ        },
 5
  me:Tinder  re
        ', 'simplexity:    comple1,
      nCount:     animatio     Count: 1,
       object
    eCount: 1,     scen    adata: {
     met    },
     7.5
        endTime:    s
  econd start at 2.0, // S 2me:tTi     starp4',
     'mrmat:   fo,
        : 1080 }heightidth: 1920, ion: { wutol  res
        seconds