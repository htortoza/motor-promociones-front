jun 23, 2026

## Motor Promociones \- Transcripción

### 00:00:00

**Charles Sepulveda:** ya me confirmó de que habl en Estados Unidos. No tienen en el roadmap mejorar eso,

**Cristian Huerta:** Pero no tienen una fecha

**Charles Sepulveda:** por lo menos no no está en esa

**Cristian Huerta:** clara.

**Charles Sepulveda:** entonces lo que nos están pidiendo eh uno de los clientes es que ellos quieren definir las promociones en Prisma, no quieren salir de Prisma, eh sin embargo, quieren esto que Prisma no hace. Entonces, la solución que tenemos es generar un motor de promociones externo, ¿cierto?, que sea una nube de promociones propias y eh generar pantallas en Prisma para que los clientes crean de que están definiendo promociones de Prisma, pero no es así. Ahora, como esto sería en nube, nos serviría para cualquier plataforma,

**Henry Tortoza:** Yeah.

**Charles Sepulveda:** la idea de cubrir Prisma, Mil One, Pro 9, lo que sea. Okay. Por otro lado, también es bueno saber cómo se va a vender esto comercialmente y algo reimportante es saber si va a tener o no va a tener la capacidad de funcionar

**Henry Tortoza:** Perfecto.

**Charles Sepulveda:** offline. marcaría un diseño ahí bien detallado de sincronización y tener la capacidad de

**Cristian Huerta:** Ahora

**Charles Sepulveda:** tener réplica de las promociones en un minimotor local instalado en los puntos de venta para que puedan accederlo si es que pierden algún tipo de conectividad o no.

### 00:01:32

**Henry Tortoza:** Vale. Oye, e el cliente que tiene la Autoplat, ¿no? El que quiere la mejor

**Charles Sepulveda:** Ya

**Henry Tortoza:** promoción.

**Cristian Huerta:** Autoplanet DBS ese eh mascota que está hace dos años

**Charles Sepulveda:** está.

**Cristian Huerta:** esperándolo,

**Henry Tortoza:** Sí, pero ¿cuál es el que decía que quería que fuese por prisma? Sí o sí, Autoplanet.

**Cristian Huerta:** eh, y tal mod y tal mod de hecho ellos sab por qué lo tienen porque ellos en la versión nueve que se están

**Henry Tortoza:** Qual modo?

**Cristian Huerta:** migrando de Retel Pro,

**Charles Sepulveda:** y

**Cristian Huerta:** ellos tienen una funcionalidad que desarrollamos nosotros como BB en su momento, como BIB desarrolló y sí tiene la mejor promoción y sí, entonces eseente cuando cambia Prisma va a perderlo.

**Henry Tortoza:** Claro,

**Charles Sepulveda:** una cuestión para el Delfi.

**Henry Tortoza:** recuerdo.

**Cristian Huerta:** Ah, entonces yo

**Henry Tortoza:** Y están de acuerdo que sea externo porque tampoco los vamosar

**Charles Sepulveda:** Sí,

**Cristian Huerta:** sí yo estoy de acuerdo.

**Henry Tortoza:** ya. Okay,

**Charles Sepulveda:** sí.

**Henry Tortoza:** ya perfecto.

**Cristian Huerta:** De hecho, lo planteé el otro día cuando me junté con Charles y Jin también. La idea es que sea algo eh externo el cálculo, a lo mejor la base de datos a lo mejor tiene que convivir con todas las bases de datos que ya tenemos de clientes son

### 00:02:36

**Charles Sepulveda:** What?

**Cristian Huerta:** los motores de Prisma como base de AT, o sea, las promociones a lo mejor hay que crearlas en el en cada en cada cliente y que esta herramienta lea la las promociones de los clientes, no sé, por decirte, cachá, porque para hacerlo es más eficiente, te digo yo, pero si no pero que el motor el cálculo y la regla tal vez esté afuera. Ya, como digo,

**Charles Sepulveda:** Sí.

**Cristian Huerta:** hace años se desarrolló un motor. Yo no lo encontré malo.

**Henry Tortoza:** H

**Cristian Huerta:** Cuando yo me vine acá eh a BB, encontré que ese motor en algunos clientes no funcionaba o no lo hacían funcionar bien, pero yo cuando estuve en Bu, en titanio, en todo el holding, el motor, yo lo instalé, lo reconfiguré a mi gusto y

**Charles Sepulveda:** Mientras había red funcionaba la raja,

**Cristian Huerta:** me

**Charles Sepulveda:** porque si no se demoraba como 45 minutos en puro cargar la pantalla para iniciar una venta.

**Cristian Huerta:** Sí, tenía sus mañas.

**Charles Sepulveda:** Ya ahí que la c\*\*\*\*.

**Cristian Huerta:** tenían sus mañas,

**Henry Tortoza:** Ya vale.

**Cristian Huerta:** pero en sí el el motor no era tan malo, eh,

**Henry Tortoza:** Entonces,

**Cristian Huerta:** solamente que tenía sus temas porque era muy pesado, porque estaba hecho en Delfi, más el Delfi de de Retel Pro 9,

### 00:03:43

**Charles Sepulveda:** Claro,

**Cristian Huerta:** entonces se chupaba casi todos los recursos de la máquina, entonces era muy pesado ecutarlo

**Henry Tortoza:** ya vale,

**Cristian Huerta:** ahí,

**Henry Tortoza:** ya.

**Charles Sepulveda:** la idea era buena.

**Cristian Huerta:** pero en sí los cálculos lo hacía

**Henry Tortoza:** E ya estamos de acuerdo entonces que tiene que ser externo, eh, que los clientes lo necesitan. Ahora hay que ver qué qué tiene que tener y cómo debe funcionar, eh, qué tipos de promociones. También está el punto de la gift card. Si bien no es lo mismo, creo que igual podríamos agruparlos en un solo sistema, porque me han pedido la cosa de giftcard y promociones también.

**Cristian Huerta:** Sí.

**Charles Sepulveda:** Pero,

**Henry Tortoza:** Ya,

**Charles Sepulveda:** ¿por qué agruparlo? Perdón, ¿por qué no hacerlo como producto separado?

**Henry Tortoza:** por para no tener una cuestión una cuestión técnica para no tener dos microservicios no más.

**Cristian Huerta:** Sí, pero ojo que la giftcard ya es un pago y lo otro es antes de hacer el pago. Entonces, ojo ahí

**Henry Tortoza:** Sí, seguro.

**Charles Sepulveda:** Claro.

**Henry Tortoza:** O sea, estoy clarísimo. Lo que pasa es que eh es una cuestión de de no de agruparlos,

### 00:04:37

**Cristian Huerta:** donde

**Henry Tortoza:** me refiero los conceptos, sino que en un mismo servicio no más, en un mismo software, van a ser módulos distintos. Ya, pero no puedo tener dos microservicios separados ahí,

**Cristian Huerta:** te cacho.

**Henry Tortoza:** Charles, por eso lo digo. Pero son módulos distintos, cachá.

**Charles Sepulveda:** Quiero hacer una sola nube con dos módulos distintos.

**Henry Tortoza:** Sí, eso es una hada técnica. No lo estoy

**Cristian Huerta:** Claro,

**Henry Tortoza:** mezclando.

**Cristian Huerta:** te entiendo. Yo te

**Charles Sepulveda:** Sí, me gustaría entender bien la razón técnica para futuros desarrollos también,

**Henry Tortoza:** Bueno,

**Charles Sepulveda:** porque conceptualmente son cosas totalmente distintas,

**Cristian Huerta:** cacho.

**Charles Sepulveda:** más que nada por eso.

**Henry Tortoza:** sí, estoy de acuerdo. De acuerdo. Veámoslo nosotros aparte. Eh, ya. Entonces, lo que nos interesa aquí con Henry es saber qué es lo que hace, qué promociones tiene, qué tipo de promociones, si son eh eh bueno, si hablamos de giftcard también, no s son giftcard, cupones, si cupones promo, eh descuentos, eh me imagino escalonado, eh packs, no séo que quieren tener todo,

**Cristian Huerta:** todo todas las combinaciones posibles y lo principal es que sea una herramienta que también vengan con ciertas funcionalidades de que te pueda decir,

### 00:05:53

**Henry Tortoza:** No.

**Cristian Huerta:** sabes que no puedes hacer esto porque hoy día, por ejemplo, Prisma, Prisma no te dice si cometiste una infracción de sa que el cliente fue y cargó una base y creó una promoción con 5000 productos. Pero Prisma no te dice que te cargó exitosamente los 5000 productos para hacer la promoción. Entonces por debajo mejor te cargó 2000, ¿no? Oye, que no está pasando esta promoción este producto. Tú revisáis y te la lata revisar los filtros y ahí te doy cuenta. Entonces muchos de los temas es que Prisma no te guía si estás haciendo algo mal. Eso entonces es silencioso,

**Charles Sepulveda:** Es como silencioso que alguien le falla,

**Henry Tortoza:** Ya.

**Cristian Huerta:** sin alerta.

**Charles Sepulveda:** no te enteras

**Cristian Huerta:** No te enteráis hasta que tiene el problema,

**Charles Sepulveda:** igual.

**Cristian Huerta:** ¿cachá? Entonces es una cosa mala que tiene el

**Henry Tortoza:** Ya. Perfecto.

**Cristian Huerta:** producto.

**Henry Tortoza:** ¿Cómo ustedes tienen clara, o sea, tienen claras las promociones que tiene que tener el sistema, todos los tipos de promociones que tiene que

**Cristian Huerta:** Sí. Y hay algunas que son más, o sea,

**Henry Tortoza:** tener?

**Cristian Huerta:** hay promociones que los clientes hoy día eh pretenden hacer, por ejemplo, eh promociones escalonadas con otra promoción, promociones asociadas a un cupón, promociones que los cupones sean válidos en cierto horario.

### 00:07:18

**Cristian Huerta:** Por ejemplo, la semana pasada me llamó un cliente, si se puede hacer un cupón que dure entre cierto horario, por ejemplo, cachá.

**Henry Tortoza:** Hasta de tarjeta crean descuento. Si pagas con un tipo de tarjeta determinada también un descuento.

**Charles Sepulveda:** Eso eso no lo han tenido nunca porque cuando tú

**Henry Tortoza:** Hm.

**Cristian Huerta:** Nunca lo han tenido.

**Charles Sepulveda:** aplicas descuento al carro todavía no sabes la forma de pago que le vas a aplicar, ¿cachá?

**Henry Tortoza:** Bueno,

**Charles Sepulveda:** Entonces, generalmente eso se cubre por temas de reembolsos más que más que

**Cristian Huerta:** Claro.

**Henry Tortoza:** visto.

**Charles Sepulveda:** al momento de descontar el carro, o sea, es como, okay, p\*\*\*, te doy cinco lucas de cashback si pagáis con tarjeta al Banco Chile, no sé, pero no lo podía pagar en el carro porque es una etapa posterior.

**Cristian Huerta:** Claro, pero pero a lo mejor sería bueno. De hecho, muchos clientes lo están pidiendo. Da lo mismo como lo están

**Henry Tortoza:** Hay hay tiendas que hacen los últimos cuatro dígitos, creo, o con los primeros cuatro,

**Cristian Huerta:** pidiendo.

**Henry Tortoza:** porque así valían qué tipo de tarjeta he comprado un par de veces y no ha funcionado y se me y se me ocurre a

**Charles Sepulveda:** Sí, es que ahí tú distingues si es Visa,

### 00:08:19

**Henry Tortoza:** mí.

**Charles Sepulveda:** si es Mastercard, va a depender del proveedor, pero cuando empiezan con pague con su tarjeta líder BCI, p\*\*\*, no tenía Vamos a verlo.

**Cristian Huerta:** Claro.

**Henry Tortoza:** Claro, claro. Estáis c\*\*\*\*\*. Ya. Oye, ¿cómo cómo bajamos los tipos promos? Porque hay que hacer hay que hacer una tabla, yo creo, con las descripciones. ¿Cómo funciona cada una? ¿Cómo cómo hacemos eso? ¿Ustedes tienen algún documento? ¿Lo saben de memoria?

**Cristian Huerta:** Mira, yo creo que yo estaba justo viendo antes haciendo como un repaso, estaba en la en la página que tiene Retel Pro que nos puede servir como guía. Yo no sé si después los chivillos les puedo dar acceso yo a Rel Pro. Dame un segundo, te voy a compartir. Entonces, eh, dame un segundo para que se hagan una idea no más que existe esta información. Entonces acá eh hay documentación de Prisma de cómo ellos tienen pensadas las promociones. No estoy diciendo que lo copiemos tal cual, pero para que Claro.

**Charles Sepulveda:** Los distintos tipos.

**Cristian Huerta:** Entonces teníciones tipo de promociones. Eh,

**Charles Sepulveda:** No se ve,

**Cristian Huerta:** un ahuta,

### 00:09:19

**Charles Sepulveda:** por si acaso.

**Cristian Huerta:** dame un segundo. Pensé estaba compartir.

**Charles Sepulveda:** Compartiendo la misma reunión.

**Cristian Huerta:** Chuta, dame un segundo.

**Charles Sepulveda:** Era la ventana al lado.

**Cristian Huerta:** Ahí estoy. Era la ventana. Cachá. Acá está como, por ejemplo, los filtros que trae Prisma, cachá. Fechas, horas. cachá, eh, sobre tiendas,

**Charles Sepulveda:** Este es

**Cristian Huerta:** sobre subsidiarias,

**Charles Sepulveda:** lo

**Cristian Huerta:** sobre listas de precio específicas, ¿cachá?

**Henry Tortoza:** como crear promo según campos, así como

**Cristian Huerta:** Claro, claro. Entonces, lo voy a hacer dinámico,

**Charles Sepulveda:** también.

**Cristian Huerta:** cachá.

**Henry Tortoza:** dinámico.

**Cristian Huerta:** Eh, dame un segundo, ¿qué más tiene esto? Entonces, hay documentación, por lo menos en Prisma que trabaja y esto es bueno, cachá, pero la idea es que podamos complementarlo nosotros, cachá. Entonces, aquí hay unos filtros que te explican cómo funcionan los filtros, cachá. Eh, un segundo que hay otro más.

**Henry Tortoza:** No.

**Charles Sepulveda:** Y y eso bueno, aparte de especificar,

**Cristian Huerta:** Eh,

**Charles Sepulveda:** oye, todo lo que tenga en este campo acá en promo, si no también tenéis todas esas combinaciones que que aparecen ahí como lleva

### 00:10:19

**Cristian Huerta:** el capitán.

**Charles Sepulveda:** la segunda unidad a mitad de precio o si te compráis una zapatilla llévate las calcetines un peso o y y lógicamente también viene la magia

**Cristian Huerta:** Claro.

**Charles Sepulveda:** de de eh que en un mismo carro puede aplicar más de una promo y más eh eh y la misma promoción más de una vez. Okay. Entonces, claro, porque si lleváis, no sé, pues zapatillas con calcetines,

**Henry Tortoza:** Yeah.

**Charles Sepulveda:** nadie quita que te puedes llevar 10 pares zapatillas y eso con lleva 10 pares de calcetines, pero tenéis 10 promociones aplicadas del mismo tipo, cacháis, cosas así. Entonces es interesante la combinatoria que se puede hacer.

**Cristian Huerta:** Ah, entonces acá tenéis otras funcionalidades que se le puede asociar a un cupón para un subtotal. Entonces,

**Henry Tortoza:** Bueno,

**Cristian Huerta:** hay asociar la promoción para ciertos clientes y filtros de clientes. Hoy día me llamó un cliente también para decirme, "Oye, yo quiero hacer promociones para decir para tipos de clientes,

**Charles Sepulveda:** listas.

**Cristian Huerta:** o sea, atributos que sab que yo quiero tener clientes VIP, gold, silver, entonces quiero clasificar, pero Prisma te los puede clasificar, ¿no? O sea, los puede clasificar, pero el motor de promociones no lo tiene.

### 00:11:32

**Cristian Huerta:** De hecho, me pidió que lo investiga,

**Henry Tortoza:** Ya.

**Cristian Huerta:** cachá.

**Henry Tortoza:** Una pregunta,

**Cristian Huerta:** Entonces,

**Henry Tortoza:** que la la segmentación de clientes va de la mano con una lista de precios distinta o solo con promociones distintas.

**Cristian Huerta:** eh la ambas, ambas puede ser ambas porque la tienda trabaja con una lista de precio,

**Charles Sepulveda:** Sí,

**Henry Tortoza:** Ya,

**Cristian Huerta:** pero el cliente puede estar definido sobre una lista de precio, ¿cachá?

**Charles Sepulveda:** claro.

**Henry Tortoza:** ya,

**Cristian Huerta:** Entonces,

**Henry Tortoza:** pero la lista la lista de precio y de segmentación está está en Prisma,

**Cristian Huerta:** o

**Henry Tortoza:** está en Retail Pro hoy no existe porque he visto que una sola lista

**Cristian Huerta:** no existe la por segmentación, no, pero por cliente sí.

**Henry Tortoza:** ya y queremos evitar segmentación nosotros.

**Cristian Huerta:** Clientes mucho piden segmentación, o sea, oye, eh, clientes premium, silver, cachá, un Cristian Huerta que es silver, le quiero mandar hasta un cupón de 20% de descuento. A un Gold le voy a mandar un 30% de descuento,

**Henry Tortoza:** Ya, ya.

**Cristian Huerta:** ¿cachá?

**Henry Tortoza:** Pero aquí estamos viendo segmentación solo de las promociones, ¿cierto? No estamos no estamos hablando lista

**Cristian Huerta:** No, segmentación, por ejemplo,

### 00:12:29

**Henry Tortoza:** precio.

**Cristian Huerta:** de cliente puede ser cartel segmentación de cliente.

**Charles Sepulveda:** mismo de tiene clientes que son salones de belleza y a ellos les dan un trato diferente.

**Cristian Huerta:** Entonces,

**Henry Tortoza:** Sí, perfecto. Les dan descuento distinto. El escalonado es un precio totalmente distinto el descuento. Lo que pasa que preguntaba por la lista de precios porque si mezclamos lista de precio más promociones igual se vuelve recomplejo. Pero si nosotros los clientes

**Cristian Huerta:** pero y ojo que Prisma lo tiene, eso. Prisma lo trabaja super bien.

**Charles Sepulveda:** Sí.

**Cristian Huerta:** prisma lo tiene nativamente lo tiene y lo trabaja super

**Henry Tortoza:** ya

**Charles Sepulveda:** Y es lo único que tiene SAP, lista de precio para descuento.

**Cristian Huerta:** bien

**Henry Tortoza:** entonces, pero segmentación para promociones no veo que haya problema, eso no es difícil si dejamos la lista de precio de lado,

**Charles Sepulveda:** No.

**Henry Tortoza:** así que si nos quedamos en promociones, no hay problema.

**Cristian Huerta:** claro, pero como te digo, hay hay información unos videos también,

**Henry Tortoza:** Perfecto.

**Cristian Huerta:** si mal no recuerdo, ¿no? Entonces, hay acceso información que podemos copiar, por decirlo así, de prisma para que vean la lógica y se hagan una idea no más, cachá.

### 00:13:31

**Cristian Huerta:** Pero pero como una como

**Henry Tortoza:** Ya

**Cristian Huerta:** una perdón, lo escuché.

**Henry Tortoza:** que nos ti ese link, porfa.

**Cristian Huerta:** Ah, que tengo que crear una cuenta, entonces te puedo mandar una cuenta para que tengan acceso.

**Charles Sepulveda:** myrilpr.com tenéis que acceso restringido.

**Henry Tortoza:** Ya,

**Cristian Huerta:** Ten que te creo una cuenta. te puedo crear un cu,

**Henry Tortoza:** ya, Bacán. Vale, entonces.

**Cristian Huerta:** pero eso entonces la idea es que yo creo que

**Henry Tortoza:** Ah, dale más, Cristian. Sorry.

**Cristian Huerta:** deemos juntarnos en otra instancia es para ver y listar todos los tipos de promociones porque ojo, no solo las promociones de Ridel,

**Henry Tortoza:** ¿Verdad?

**Cristian Huerta:** sino que también están las promociones de hospitalidad, ¿cachá? Que ahí, por ejemplo, ahí tenía el tema de lo que mencionaba alguien de ahí, la el tema de las tarjetas, o sea,

**Charles Sepulveda:** Yeah.

**Cristian Huerta:** eh en en todos tienen, no sé, descuento el fin de semana con descuento Falabela, cachá, CRM Falabela, cachá. Entonces, hay descuentos con temas de tarjetas que hay que tenemos que pensarlo. ¿Cómo trabajar eso, cachá?

**Henry Tortoza:** Pero ese descuento no se hace directo con el prohiedor de la tarjeta.

### 00:14:38

**Henry Tortoza:** ¿Qué tendríamos que ver ahí

**Cristian Huerta:** No, depende porque lo aplican en la cuenta.

**Henry Tortoza:** nosotros?

**Cristian Huerta:** Pues yo cuando voy al al restaurant, yo voy al local y voy al local,

**Charles Sepulveda:** Bien.

**Cristian Huerta:** de hecho me lo aplica eh del grupo Los Robles. Voy al local y me hacen el 40 el tiro. Me lo aplican

**Henry Tortoza:** O por ejemplo, sí,

**Charles Sepulveda:** Claro, no es

**Henry Tortoza:** pero decir que vas a pagar con CRM Falavela y te apan el descuento.

**Cristian Huerta:** enter.

**Henry Tortoza:** Sí, pero esa a lo que voy es que quién emite ese descuento es para la vela junto con la tienda, no nosotros, no el cliente

**Cristian Huerta:** No,

**Henry Tortoza:** solo.

**Cristian Huerta:** de hecho anda, se nota que no ha ido almorzar, ha ido a comer al grupo. Anda pagar con CMR y dile descuento Faláela. Henos el

**Henry Tortoza:** Es que no tengo no tengo no tengo falabela,

**Cristian Huerta:** 20\.

**Henry Tortoza:** pero lo que voy sigo insistiendo es lo mismo, porque de qué manera el cliente va a decir, "Voy te voy a dar descuento con CMR Falabela si es que no tiene un convenio con

**Cristian Huerta:** Ah, no, pues obviamente lo tiene,

**Henry Tortoza:** Falabela.

**Cristian Huerta:** obviamente lo deben tener.

### 00:15:32

**Cristian Huerta:** Entonces tienen que programar esa promoción en su punto, en su en su sistema. Pero, por ejemplo, yo cuando voy al grupo de los Robles digo, "Ah, tienes descuento Falabela." Sí, hoy día sí. Perfecto. Y me aplica el tiro el 40 y me trae ya la cuenta la cuenta en el grupo, no sé,

**Charles Sepulveda:** Depende, claro,

**Cristian Huerta:** el otro día fui al restaurant de comida española.

**Charles Sepulveda:** pero depende que le avises a quién te está atendiendo y quién te está atendiendo que lo aplique.

**Cristian Huerta:** Claro. Y

**Henry Tortoza:** Y si te está entendiendo,

**Cristian Huerta:** ahí

**Henry Tortoza:** verifica que sea la tarjeta con la que estás pagando.

**Charles Sepulveda:** Claro. Entonces, él activa de forma manual ese descuento.

**Henry Tortoza:** Es una es una manual. Ah, ya,

**Cristian Huerta:** claro,

**Henry Tortoza:** ahí está el punto. Es una promo manual porque la automática no tenemos nada que ver nosotros.

**Cristian Huerta:** claro.

**Henry Tortoza:** Eso lleva.

**Cristian Huerta:** Pero una manual que obviamente hay que enlazársela a los clientes que probablemente te van a pedir hacerlo, ¿cachá?

**Henry Tortoza:** Ya, de acuerdo.

**Cristian Huerta:** Pero pero la la la el tema va que tenemos que hacerlo ya con

**Henry Tortoza:** Perfecto.

### 00:16:19

**Cristian Huerta:** pensando también con TCP. Entonces, yo creo que después hay que juntarnos entre todos los que conocemos todos los productos y y verlo ahí, ¿cachá?

**Henry Tortoza:** Perfecto. Oye, y y

**Charles Sepulveda:** cliente que tiene más las prom Flores, qué cuál es el cliente que tiene las promociones más

**Cristian Huerta:** Ah,

**Charles Sepulveda:** raras.

**Cristian Huerta:** yo creo que Mascota, mascota tiene un tiene un tema ahí con las tiene cupones mezclados. Tiene, yo creo que entre mascota, ¿quién más puede ser el otro? Mascota.

**Charles Sepulveda:** Flor por lo menos las tiene

**Cristian Huerta:** Sí, manuales,

**Charles Sepulveda:** manuales.

**Cristian Huerta:** claro. Y aparte ellos lo tienen en la otra herramienta, así que desconozco cómo las tienen ellos. Recuerda que usan el Claro,

**Charles Sepulveda:** Cloud promo, pero manual.

**Cristian Huerta:** cloud promo.

**Charles Sepulveda:** El casero selecciona la promo que quiere aplicar.

**Cristian Huerta:** Muy raro esa ese cliente. ¿Por qué hace eso? Pero bueno,

**Charles Sepulveda:** Las viejitas se conocen de memoria las promociones y así les gusta.

**Henry Tortoza:** Bueno,

**Cristian Huerta:** claro.

**Henry Tortoza:** ya. Entonces, pero el enfoque sería que nosotros tenemos que habilitar eso mismo dinámico y además unas promos

**Charles Sepulveda:** Per

**Henry Tortoza:** como específicas que no son dinámicas porque son más complejas.

### 00:17:27

**Henry Tortoza:** Eso es como la idea,

**Cristian Huerta:** Sí, hay muchas más complejas y pensando ahí ciertas funcionalidades y ciertas reglas que podamos dejar configuradas,

**Henry Tortoza:** ¿no?

**Cristian Huerta:** porque por ejemplo hay clientes que te van a decir que calcule la mejor promoción posible, pero otros clientes te van a decir, "¿Sabéis que no, yo no quiero trabajar con la mejor promoción posible?" Porque si le da el mejor descuento, eh, sabéis que yo quiero darle esta promoción a los clientes, cachá, y de alguna forma me los quiero como c\*\*\*\*, cachá, no quiero perder margen. Entonces, cachá,

**Henry Tortoza:** Bueno,

**Cristian Huerta:** entonces listo.

**Henry Tortoza:** ya

**Cristian Huerta:** Ellos lo puedan configurar. Porque claro,

**Charles Sepulveda:** H

**Cristian Huerta:** que

**Henry Tortoza:** cómo verían ustedes que se utilizaría este producto ellos entrarían y

**Cristian Huerta:** les

**Henry Tortoza:** cómo configurarían una promoción Tam.

**Cristian Huerta:** moo lo conozco. Dame un segundo si tengo acceso acá a un ambiente. Dame un segundo y te puedo mostrar ahí para que te hagáis una idea. A ver, voy a conectar un cliente.

**Henry Tortoza:** He. Ok.

**Cristian Huerta:** Ay, qué se cambia el icono.

**Charles Sepulveda:** Sí, perfecto.

**Cristian Huerta:** Me cambia el icono. Pero antes dear, antes dear

**Charles Sepulveda:** Gracias.

### 00:18:56

**Cristian Huerta:** entonces, ¿cómo te cómo cómo lo traja Prisma? Por ejemplo, tienes un módulo de promociones, que ahí está el módulo, por ejemplo. Entonces, tú tienes un buscador para buscar las promociones y acá tú puedes entrar a ver las promociones. Entonces damos

**Charles Sepulveda:** Ahora lo que queremos nosotros, por lo menos como lo hemos dibujado, es que este motor de promo que va a estar cloud tenga su propia pantalla

**Cristian Huerta:** seg

**Charles Sepulveda:** de configuración de promociones, pero hay muchos clientes que quieren meterse aquí,

**Henry Tortoza:** Mhm.

**Charles Sepulveda:** configurar aquí y y que para ellos sea transparente. No quieren ocupar más consola. como el como Ital mod que se ponen repesados con esa cuestión. Entonces, la única alternativa que nos queda es o le falsificamos esta pantalla o todo lo que ellos definen aquí lo integramos al motor de promociones.

**Cristian Huerta:** que ver, pero acá, por ejemplo, estoy mostrando No

**Charles Sepulveda:** Entonces, por API que podamos definir promo, independiente que la propia UI del promo engine ocupe su propia,

**Henry Tortoza:** No.

**Cristian Huerta:** to

**Charles Sepulveda:** cachá.

**Henry Tortoza:** El mod tiene que entender que no puede que no está disponible los otros. Hón está. Yo creo que ahí cometeríamos quizás un error en tratar de darle algo que no existe y que no se puede, huón.

### 00:20:09

**Henry Tortoza:** ¿Cachá? Entonces nos estaríamos disparando en el pie porque una vez que nosotros les decimos que sí y lo habilitamos si no termina haciendo lo que ellos quieren, hón, vamos a estar metidos en un tremendo problema.

**Cristian Huerta:** Claro.

**Charles Sepulveda:** que ya estamos en eso. Ya hemos hablado varias veces con Jelvin y por eso este ticket

**Henry Tortoza:** ¿Y

**Charles Sepulveda:** cuando hace un tiempo de hecho lo conversamos nosotros, yo te dije, mira, esa no se puede hacer, no existe directo en Prisma y de ahí no hemos sacado

**Henry Tortoza:** cuál fue

**Charles Sepulveda:** al famoso cliente. Entonces, ¿qué nos queda? que configure la c\*\*\*\*\* aquí, pero que Prisma no ocupe su motor de promociones, sino que solamente su pantalla de configuraciones es la alternativa que nos

**Cristian Huerta:** Claro.

**Charles Sepulveda:** queda.

**Cristian Huerta:** Ya, mira, ahí te estoy mostrando cómo una forma. Acá hay una parte donde tú pones algo descriptivo. Todo esto es por descripción y sacar dato,

**Charles Sepulveda:** Tierna

**Cristian Huerta:** información estadística.

**Charles Sepulveda:** nivel

**Cristian Huerta:** Acá tienes rangos de fecha y hora hasta que inicia y horas de término de la promoción, ¿ya? ¿Dónde está vigente? ¿Ya? Eh,

**Charles Sepulveda:** subsidiario.

### 00:21:08

**Cristian Huerta:** tienes eh filtro, filtros de tiendas, empresas, subsidiar aquí si él tuviera más empresas, fueron un holding de varias empresas, esta promoción la pueden cambiar para distintas empresas o la aplican para distintas empresas y aquí puedes seleccionar las tiendas. Si te fijáis, esta promoción no aplica para todas las tiendas, ¿cachá?

**Henry Tortoza:** Claro.

**Cristian Huerta:** siendo que los productos casi la gran mayoría son transversales para todas las tiendas, entonces lo tienen ahí para cierto. Ya, acá está lo que yo te decía, los niveles de precio. Tú puedes trabajar los niveles de precio. Entonces, mira, este cliente tiene siete listas de precios, cachá. Cachá.

**Henry Tortoza:** Mm.

**Cristian Huerta:** Entonces puede ser que en esta lista de precio aplica, en este caso está trabajando en todas esta promoción en cualquier lista de precio que ellos trabajen la va a trabajar

**Henry Tortoza:** Es que entonces va la lista de

**Cristian Huerta:** el de Sí, pues no s te decía,

**Henry Tortoza:** precio.

**Cristian Huerta:** pero que lista de precios, pero la lista de precios del producto, es un atributo del producto en este caso, ¿cachá?

**Henry Tortoza:** Ya,

**Cristian Huerta:** Entonces

**Henry Tortoza:** pero es un atributo del producto,

**Cristian Huerta:** ahí

**Henry Tortoza:** pero que se le asigna a un a qué cosa? a un cliente, por ejemplo,

### 00:22:10

**Cristian Huerta:** en este caso eh es el que caso que estoy interactuando es el cliente en este caso,

**Henry Tortoza:** No.

**Cristian Huerta:** ¿cachá? Entonces acá en este caso la lista de precios en este caso esta promoción si fuera la tienda Curicó y fuera cualquier cliente va a ser independiente la lista de precio, cachá. Pero, por ejemplo, pero Chal te dijo un ejemplo recién, supongamos que la lista cinco, que es exclusiva para la gente de la de los profesional

**Henry Tortoza:** Claro.

**Charles Sepulveda:** Los salones, losist

**Cristian Huerta:** Claro. Los Claro, los mayoristas. Entonces, sobre esa lista a lo mejor ellos tienen esa promoción. Entonces, cuando va un mayorista a una tienda Prismology, que es la otra cadena que ellos tienen, esta promoción es solamente para los mayoristas. Entonces, probablemente ese cliente tiene un atributo que está asociado a la lista de precio, ¿cachá? Y ese es un atributo del cliente

**Charles Sepulveda:** Sí.

**Henry Tortoza:** Claro. Y y de dónde sacaríamos esta lista de precio del mismo

**Cristian Huerta:** porque del mismo Prisma. De hecho, Prisma,

**Henry Tortoza:** prisma.

**Cristian Huerta:** por ejemplo, hoy día lo que tú hací One, tú te lleváis muchos datos de Prisma a Mobile One. Te lleváis la maestra, los códigos y los listas de precios.

### 00:23:11

**Cristian Huerta:** Tú ya te lleváis las listas de precio a Mobile One y el precio correspondiente a la lista de precio que tiene el

**Charles Sepulveda:** He.

**Cristian Huerta:** producto. Cachá, si este porque este es la el nivel de listas de precio que tiene el sistema,

**Henry Tortoza:** Perfecto.

**Cristian Huerta:** pero puede que este producto tenga dos listas de precios llenados no más, cachá. Trabaje con la lista base y PvP y a lo mejor los otros no están llenados, cachá.

**Henry Tortoza:** Claro.

**Cristian Huerta:** Pero pero este cliente trabaja con siete niveles de precio, ya uno, no sé,

**Henry Tortoza:** Perfecto.

**Cristian Huerta:** es el base, otro es el de la tienda, el otro es mayorista, el otro es del e-commerce. Yo sé que el cinco es del e-commerce, entonces el seis no recuerdo y el siete tampoco, cachá, pero tiene siete niveles de precio, pero casi lo ocupa todos. Yo te diría que ocupas de los 7 CO, por

**Henry Tortoza:** Ya, perfecto. Ya que mencionaste e-commerce,

**Cristian Huerta:** ejemplo,

**Henry Tortoza:** quiere decirte que este sistema, si es que el cliente tiene Shopify y crea la proma, acá tenemos que enviarla a

**Cristian Huerta:** no lo tienen que venir a consultar.

**Henry Tortoza:** Chopify.

**Cristian Huerta:** De hecho, es un proyecto que estoy vendiendo con un cliente que quiere ocupar Prisma como un motor único de promociones, cachá.

### 00:24:11

**Cristian Huerta:** O sea, quiere tener un un motor de promociones eh ovnicanal, o sea,

**Henry Tortoza:** Claro.

**Cristian Huerta:** las tiendas están seteadas, las el móvil one que ya está listo, entonces ya tiene el móvil one y las tiendas, le falta le falta el e-commerce. Entonces, entonces me están pidiendo, oye, ¿cómo conecto? Le dije,

**Henry Tortoza:** Tak.

**Charles Sepulveda:** e

**Cristian Huerta:** ya de la misma forma que te nosotros nos conectamos con Mobile One, con el prom con el promochá. Entonces, consumí mismo servicio, lo tenéis que tener expuesto como lo tenemos para Móilw y consultáis bajo los mismos criterios que ya no hemos reunido en reuniones con él para explicarle cómo consultar las

**Henry Tortoza:** Ya, porque si es así,

**Cristian Huerta:** promociones.

**Henry Tortoza:** entonces este sistema de de motor de promociones tendría que estar conectado con muchas cosas más, con Prisma,

**Cristian Huerta:** Por eso que eso es Sí,

**Henry Tortoza:** con e-commerce, con Móil One, con todo.

**Cristian Huerta:** de hecho es eso es esto tiene que ser un producto ovnicanal.

**Charles Sepulveda:** Correcto.

**Henry Tortoza:** Claro.

**Cristian Huerta:** en el

**Henry Tortoza:** Entonces sería como sería como lo que hace multivende,

**Cristian Huerta:** ojo.

**Henry Tortoza:** pero con las promos. Debería ir para todos los e-commerce que tenga o al revés o el e-commerce viene para acá.

### 00:25:14

**Cristian Huerta:** El Claro, nos consume,

**Charles Sepulveda:** Correcto.

**Cristian Huerta:** nos

**Henry Tortoza:** Ya. Okay. Entonces,

**Cristian Huerta:** consume

**Charles Sepulveda:** Es una API que tienen que tener al cliente.

**Henry Tortoza:** hay que tener hay que tener una API donde todos consuman. Así de simple.

**Cristian Huerta:** exactamente,

**Charles Sepulveda:** ¿Correcto?

**Henry Tortoza:** Ya, el rey.

**Cristian Huerta:** no sé si una API ahí ya. Y aquí, por ejemplo, podéis poner días de la semana,

**Henry Tortoza:** Ok.

**Cristian Huerta:** sabéis que mira, esta promoción es de todo el año, pero solo los viernes. Perfecto. ¿Entre qué horario? Entre qué horario, entre horas. La hora feliz. Todos pueden ir a este descuento entre x horas hasta ciertas horas. Si bien la promoción tiene una vigencia desde desde hasta un acta,

**Henry Tortoza:** Yeah.

**Cristian Huerta:** pero yo lo puedo decir que ahora quiero que la promoción trabaje un día específico a la semana, cachá, pero a cierta hora. A ese nivel puedo llegar el desglos. Muchos, muchos clientes, sí, lo que nos han pedido es que esta funcionalidad no han pedido,

**Henry Tortoza:** Perfecto.

**Cristian Huerta:** ¿sabes que lo quiero por día? O sea, el jueves quiero de una a dos, pero el viernes lo quiero de tres a cuatro, el jueves la quiero de cinco a seis.

### 00:26:13

**Cristian Huerta:** Esto solamente

**Henry Tortoza:** Es muy hospital,

**Cristian Huerta:** Ah,

**Henry Tortoza:** muy hospitalada esa como las promo ciertos días esta hora.

**Charles Sepulveda:** el

**Cristian Huerta:** sí, claro, claro. Ca está. Entonces eso se puede combinar con otras promociones.

**Henry Tortoza:** Claro.

**Cristian Huerta:** Sí. No sabes qué solo con ella, cachá. Entonces porque no es una promoción sobre otra promoción. Si no se hubieran todas las promociones aplicadas se le harían regalado

**Charles Sepulveda:** Hasta ahora no he conocido ninguno que le guste promo sobre

**Cristian Huerta:** el Claro.

**Charles Sepulveda:** promo.

**Cristian Huerta:** Cachá.

**Henry Tortoza:** Sí, que si vas por porcentaje lo puedes llegar, no sé, la cuenta 10% te quedan debiendo plata.

**Charles Sepulveda:** terminar

**Henry Tortoza:** Te pagan.

**Cristian Huerta:** Claro. Y acá hay otras cosas que permite Prisma que si que le quería aumentar el precio,

**Henry Tortoza:** Sí,

**Charles Sepulveda:** pagando.

**Cristian Huerta:** tú lo querías como nivelar porque puedes dudoso de que esté regalándole un peso tenga poder hacerlo, cachá. Eh, tiene otra funcionalidad que es ilimitado,

**Henry Tortoza:** ya.

**Cristian Huerta:** o sea, las veces que tú quieras, las veces que yo quiera y le puedo decir un conteo. O sea, sabéis que esta promoción se aplica x veces, ¿ya?

### 00:27:19

**Cristian Huerta:** Pero esto tiene una limitante, ya.

**Henry Tortoza:** Mhm.

**Cristian Huerta:** Esto tiene una limitante que muchos clientes nos piden. Eh, la limitante de que esto si yo creo una promoción para las primeras 100 personas que vengan a la tienda, listo, está perfecto. Pero si yo lo quiero limitar para una persona en específico,

**Henry Tortoza:** Ya,

**Cristian Huerta:** no lo tengo.

**Henry Tortoza:** ya. Ah, como un cupón. Un cupón. único para una persona.

**Charles Sepulveda:** que se queme para a las 100 primeras personas.

**Cristian Huerta:** Por ejemplo,

**Charles Sepulveda:** Listo, te hago 100 compras.

**Cristian Huerta:** listo. A la 101 jode. Listo. Pero en este caso muchos clientes dic, sab que no tienes la opción y lo que tenemos que decirle, sab que genera un cupón para esa persona y ahí lo ahí safá, cachá. Pero pero el conteo acá es que las primeras 100 ventas va a aplicar esta promoción a la venta 101 condición no va a funcionar, ¿cachá?

**Henry Tortoza:** Claro.

**Cristian Huerta:** Tiene un contador, pero es para la promoción en símado y una pura vez, o sea, la prim va a funcionar una pura vez la primera venta del día.

### 00:28:18

**Cristian Huerta:** promoción válida para la primera venta del día,

**Henry Tortoza:** Claro,

**Cristian Huerta:** ¿cachá?

**Henry Tortoza:** esa está ya.

**Cristian Huerta:** Eso ya eso un tema y después vienen las reglas y aquí pued

**Henry Tortoza:** Acá

**Cristian Huerta:** jugar con filtros, por ejemplo, acá tenéis todas las maestras de productos,

**Henry Tortoza:** perfecto.

**Cristian Huerta:** como yo escogí productos, me trajo los campos de de de los productos, los códigos. Acá, por ejemplo, cargaron todos los códigos de productos, cachá, con una condición de o, cachá. Entonces ahí trabajaron y agregaron todos los productos. Entonces, esto para que se hagan una idea no más. cachá eso puiséis también trabajarlas con

**Charles Sepulveda:** Lo otro que yo estaba pensando si podemos incluirlo o no, como para agregarle valor al el producto en sí,

**Cristian Huerta:** subs.

**Charles Sepulveda:** el control de devoluciones de las promociones, porque ahí p\*\*\* se va presta caleta para fraude, como ya no sé, llévate los calcetines gratis con las zapatillas, te lo lleváis para la casa y después llegáis con la boleta y devolví la zapatillas y te quedáis con los calcetines gratis. No sé, h así. Entonces,

**Cristian Huerta:** acceso a la

**Charles Sepulveda:** e también hay un tema ahí de control que que no es menor, por lo menos para el mundo

### 00:29:19

**Cristian Huerta:** sú.

**Charles Sepulveda:** retail.

**Henry Tortoza:** Ya, e, oye, y en cuanto a giftcard, esa es la que todos conocemos, ¿no?, que se emite e una giftcard con cierto

**Charles Sepulveda:** Eso es forma de pago,

**Henry Tortoza:** forme pago.

**Charles Sepulveda:** eso no reduce plata, eso es una forma de pago.

**Henry Tortoza:** Es

**Charles Sepulveda:** Eso no van, no tiene nada que ver con el carro. Eso está en en el último paso cuando tú decides cómo vaya a pagar

**Henry Tortoza:** sí.

**Charles Sepulveda:** una una transacción.

**Cristian Huerta:** Claro,

**Henry Tortoza:** Perfecto.

**Cristian Huerta:** ya, pero se entiende la idea. Yo les puse esto con un ejemplo, pero en sé que en en TC Post tiene más funcionales de promociones

**Henry Tortoza:** Sí,

**Cristian Huerta:** que lo me ha mostrado que viene en su momento por si

**Henry Tortoza:** ya podríamos podríamos hablar con Kin entonces cuando vuelva para que nos muestre las promos de de ese

**Cristian Huerta:** acá,

**Henry Tortoza:** post. Bueno,

**Cristian Huerta:** pero

**Henry Tortoza:** entonces eh creo que con eso estamos, ¿no? Tendríamos que revisar la cuenta de Retail Pro, la que nos crees ahí tú, Cristian, y vemos ese la información que hay ahí, la extra y y vemos, vamos moldeando la idea.

**Cristian Huerta:** Sí, no hay que pero igual concretándolo luego cachá para ver cómo lo podemos trabajar.

### 00:30:40

**Cristian Huerta:** Lo bueno que la gran mayoría de nuestros clientes ya están en Prisma. Eh, muy pocos quedan en Retel Pro, ¿no? Así que la gran mayoría son Prisma, pero la idea es ya empezar ya a moldear esto, cachá. Por último, ver si va

**Charles Sepulveda:** El otro sí estaba pensando el otro. Podríamos revisar las definiciones que hay en el antiguo sistema de promociones que se hizo para

**Cristian Huerta:** chó.

**Charles Sepulveda:** Rel Pro 9, como el que tiene Ital, porque ese es bien completo, tiene unas combinatorias más raras que la de

**Henry Tortoza:** Co?

**Charles Sepulveda:** esta.

**Cristian Huerta:** Puede ser. Yo ya ni me acuerdo. Yo lo ocupaba para hacer estas funcionalidad no

**Charles Sepulveda:** Sí,

**Cristian Huerta:** más.

**Charles Sepulveda:** eso lo hizo el Parragués por darse caleta de año.

**Henry Tortoza:** Bueno, ya. Entonces,

**Cristian Huerta:** Claro.

**Henry Tortoza:** vamos a bajar esto y nos juntamos, pues, huón.

**Charles Sepulveda:** No.

**Cristian Huerta:** Ya. Pero, ¿cómo seguimos entonces?

**Henry Tortoza:** Eh,

**Cristian Huerta:** que no quiero que queden en esta reunión,

**Henry Tortoza:** ustedes igual nos tienen que pasar nos tienen que pasar las promos que son más específicas

**Cristian Huerta:** no quiero que quede aquí muer

**Henry Tortoza:** que no van dentro de ese formulario, porque quedamos de acuerdo con que algunas son dinámicas y otras son complejas y las complejas no van dentro del

### 00:31:40

**Cristian Huerta:** ya.

**Henry Tortoza:** formulario, a no ser de que encontremos que puedan ir dentro del formulario, pero pero al parecer no se puede de momento. Entonces, son esos dos tipos de de promociones. Nosotros revisamos las dinámicas, ustedes revisan las complejas y nos

**Cristian Huerta:** Ya yo voy a anotar ahí.

**Henry Tortoza:** juntamos eh el viernes quizá. ¿Cómo estáis de tiempo? El viernes no estoy viernes el lunes. Entonces, el lunes feriado, ¿verdad? Martes. Bueno, próximo martes, próxima semana, la misma hora.

**Charles Sepulveda:** Ya vale.

**Henry Tortoza:** Vale,

**Cristian Huerta:** Ya te puedo en paralelo tu

**Henry Tortoza:** ya eso.

**Charles Sepulveda:** Sí, por supuesto. De hecho, iba a pedir una cuenta retailpro.com que expiró la

**Cristian Huerta:** tema

**Charles Sepulveda:** mía.

**Cristian Huerta:** después que tengo chiquillos.

**Charles Sepulveda:** Dale,

**Cristian Huerta:** Nos vemos entonces.

**Charles Sepulveda:** ya. Gracias,

**Henry Tortoza:** Chao.

**Charles Sepulveda:** Henry.

**Henry Tortoza:** No,

**Charles Sepulveda:** Gracias, David.

**Henry Tortoza:** tengo.

**Cristian Huerta:** Mira,

**Charles Sepulveda:** Chao.

**Cristian Huerta:** encontré tus tareas, hombre.

**Charles Sepulveda:** Sí,

**Cristian Huerta:** Están acá.

### 00:32:46

**Charles Sepulveda:** pero en ese panel pues no no en el que ve todo el mundo.

**Cristian Huerta:** Pero si la idea es que ocupa,

**Charles Sepulveda:** Hón,

**Cristian Huerta:** lo encontré, pues. Ya,

**Charles Sepulveda:** ya. Y qué y qué le digo a la gente que se meta

**Cristian Huerta:** esto lo o sea,

**Charles Sepulveda:** aquí.

**Cristian Huerta:** la idea es que puedan tener un solo lugar porque si no la encuentren hoy día, si por eso te crees este panel de acá, este es otro tema, pero este panel que está acá es para encontrar las tareas, los B, que yo estaba viendo a David todos los días que se no se ponían de acuerdo contigo para encontrar los B, cachá. Entonces acá

**Charles Sepulveda:** Es que por lo mismo, porque la gente tiene un listado y ahí nosotros le definimos en qué secuencia tiene que hacerlo y todo,

**Cristian Huerta:** yo

**Charles Sepulveda:** pero si no v las tareas, p\*\*\*, vamos a estar en

**Cristian Huerta:** no s,

**Charles Sepulveda:** problema.

**Cristian Huerta:** pero a todos se les pierden. Pero también tú tení algunas tareas perdidas, entonces a todos se nos pierden. Entonces, pero fíjate que las que tú me dijiste las de Roy las encontré todas acá.

**Charles Sepulveda:** Sí, pero Roger no ve eso.

**Cristian Huerta:** Acá la no

**Charles Sepulveda:** Ya listo le digo,

**Cristian Huerta:** se

### 00:33:36

**Charles Sepulveda:** Roger trabaja. Y el me decí, "Ya, pero no veo mis tareas." Pues p\*\*\*

**Cristian Huerta:** pero mira lo primero en click yo las encontré todas ya yo la encontré esta

**Charles Sepulveda:** que

**Cristian Huerta:** esta creo que esta aparecía en tu vamos a el reporte que esto era Roger. Dame un segundo. Voy a quitar todos los filtros. Eh, esto voy a quitar cliente.

**Charles Sepulveda:** parece que no están en la en la lista

**Cristian Huerta:** Dame un segundo.

**Charles Sepulveda:** es,

**Cristian Huerta:** Voy a agregar al

**Charles Sepulveda:** pero arriba tiene el el asignado tiene el icono ahí al lado tu de

**Cristian Huerta:** No,

**Charles Sepulveda:** la de tu

**Cristian Huerta:** prefiero en la que entonces trabaja con ese.

**Charles Sepulveda:** inicial,

**Cristian Huerta:** Listo. Solamente me aparece ese.

**Charles Sepulveda:** ¿cachá?

**Cristian Huerta:** Claro,

**Charles Sepulveda:** Entonces el re me dice,

**Cristian Huerta:** porque este Ya,

**Charles Sepulveda:** "No tengo la tarea." Que

**Cristian Huerta:** entonces yo la voy a borrar de ahí, eh, no es que si borra ese

**Charles Sepulveda:** fueron fueron creadas fuera de la carpeta del espacio este de desarrollo retail.

**Cristian Huerta:** filtro

**Charles Sepulveda:** Eso puede

**Cristian Huerta:** cachá, están fuera. Si eso por eso te digo,

**Charles Sepulveda:** ser.

**Cristian Huerta:** pero esta la agregaron al espacio, por eso tú la ves acá.

### 00:34:47

**Charles Sepulveda:** O sea, la agregaron al espacio.

**Cristian Huerta:** Es cach.

**Charles Sepulveda:** No sé, no sé si agregaron espacio. A ver,

**Cristian Huerta:** Entonces están acá Autoplanet,

**Charles Sepulveda:** ¿a qué listas pertenece esa tarea? Arriba.

**Cristian Huerta:** proyecto abierto. Fíjate,

**Charles Sepulveda:** Tapa dosa un

**Cristian Huerta:** todos están en esa menos. Están todas

**Charles Sepulveda:** poquito, un

**Cristian Huerta:** esas.

**Charles Sepulveda:** poquito. ya guardar la tiene que puro con el sistema. Ya. Entonces esa tarea

**Cristian Huerta:** Ya voy. Richard que me está pidendo yo. Entonces esas tareas están ahí, ¿cachá?

**Charles Sepulveda:** pero

**Cristian Huerta:** Pero pero pero lo más raro es que mira,

**Charles Sepulveda:** no

**Cristian Huerta:** eh, ¿cómo estamos hoy día? Estoy perdiendo los días. ¿Qué día estamos?

**Charles Sepulveda:** mar 23\.

**Cristian Huerta:** Si yo martes 23\. Ahí 23\. De hecho, yo veo que Roger hoy día tú le asignaste alguna tarea hoy día. Por lo menos esa tarea a Roger se la ve hoy día. esa esa tarea que es una de las autoplanes que tú me dijiste.

**Charles Sepulveda:** Mhm.

**Cristian Huerta:** Yo la veo la tarea de autoplanet y mi funcion valor que es parte hoy efectivamente, ¿cuándo se la asignasta Roger?

### 00:36:42

**Cristian Huerta:** Hoy ahí está.

**Charles Sepulveda:** Sí, pues ya está trabajando en eso, pero pero él él partió con eso porque yo manualmente le dije ahí tenía el enlace de la tarea porque él no la

**Cristian Huerta:** Claro.

**Charles Sepulveda:** veía.

**Cristian Huerta:** Entonces ahí esta ya esta ya está asignado. Eh, esta otra yo vi que la tiene Roger asignada. Todas esas que tú me mandaste, Roger las tiene asignadas,

**Charles Sepulveda:** Sí, pues si yo se la asigné,

**Cristian Huerta:** pero parte de otros días.

**Charles Sepulveda:** pero no las ve a eso. O sea, las ves si le da manualmente clic al enlace que le

**Cristian Huerta:** al link. Claro,

**Charles Sepulveda:** di.

**Cristian Huerta:** porque no está arriba. Cach porque no está arriba. No está ahí. Entonces yo por eso desarrollé esto.

**Charles Sepulveda:** Proyecto abierto.

**Cristian Huerta:** Cach está dentro de proyectos abiertas esas tareas.

**Charles Sepulveda:** ¿Qué?

**Cristian Huerta:** Cachá.

**Charles Sepulveda:** Pues yo no veo es ese espacio tampoco. Ah, ah, no, acá estamos. A ver, proyecto abierto aética, autoplanet n r. Después tenía aquí,

**Cristian Huerta:** Ya, pero mira,

**Charles Sepulveda:** p\*\*\*. ¿Dónde está

**Cristian Huerta:** mira, ya, ya. Pero mira, pongamos ejemplo esta tarea, chat.

### 00:38:13

**Cristian Huerta:** Mira, esta tarea que tiene Roger,

**Charles Sepulveda:** la

**Cristian Huerta:** tú se la asignaste hoy día, ¿no es cierto? Y tú estimaste que tenía, creo que 15 horas. Dame un segundo. Esta cuándo deía terminarla entonces él,

**Charles Sepulveda:** espérate que está cargando la cuestión el retiro valor?

**Cristian Huerta:** eh, sí, ese es el que partió hoy día.

**Charles Sepulveda:** Ya dice 30 horas son 6 días. Ojo, el lunes feriado y el Yelvin le agregó un día extra.

**Cristian Huerta:** David me dice mandar un rato correo por si

**Charles Sepulveda:** Ya.

**Cristian Huerta:** acaso

**Charles Sepulveda:** Ahora esta tarea que está aquí, funzionalidad, retiro valores. Eso era, ¿no?

**Cristian Huerta:** 30 horas.

**Charles Sepulveda:** Conidad, retiro valores.

**Cristian Huerta:** Entonces yo veo que ch Roger parte hoy día y esa 1, dos 3 cu parece que est click cuenta sábado y domingo. Entonces un dos 3 cu después yo me voy al lunes que es feriado, no sé qué contarlo. p\*\*\*, lo voy a entrenar como el el martes o miércoles por ahí. Se perdió los días. Cach. Ah, no, porque son 30 horas. Voy a entregar como el juego.

**Charles Sepulveda:** Y

**Cristian Huerta:** Ah, ya.

### 00:39:57

**Cristian Huerta:** Y lo otro, tú me preguntaste por otra tarea que no la veías. Yo sí la veo acá. Si te fijas, incorporación de control de documentos fantasma viene vencida. Entonces, eh Roger la trae atrasada. Yo también la yo la veo en este panel que que construí. Yo lo veo. Viene, de hecho fue una de las tareas que tú me pasaste. Me dijiste control de boletas fantasma. ¿Dónde lo dónde?

**Charles Sepulveda:** Eso ya eso ya lo entregó.

**Cristian Huerta:** Eh, a ver, viene. No, diceo. Mira, cachá. Y lo tiene Roger asignado. Hoy escribió, ¿viste?

**Charles Sepulveda:** A ver, gente

**Cristian Huerta:** De hecho, lo asignaste tú mismo y en la mañana.

**Charles Sepulveda:** aquí.

**Cristian Huerta:** Cachá. Entonces, claro, estaba con fecha de inicio hace 6 días, pero tú solaste hoy día. Entonces, por eso acá en este panel me quedó

**Charles Sepulveda:** Mira lo que dice. Mira,

**Cristian Huerta:** atrasado.

**Charles Sepulveda:** carga la lista retail prioridad de ahora.

**Cristian Huerta:** Ya, ahí está.

**Charles Sepulveda:** Pero cachá que Roger ahora aparece con una de esas cuatro. Pero, ¿qué hice? Cacha. Vamos a la Vamos a la de Autoplanet.

### 00:41:33

**Cristian Huerta:** La tuviste que agregar,

**Charles Sepulveda:** Mira,

**Cristian Huerta:** tuviste que ir autoplanes y moverla para acá y subirla para

**Charles Sepulveda:** no, no la moví. Mira, no la moví.

**Cristian Huerta:** acá.

**Charles Sepulveda:** Vamos a la de Autoplanet. Mira esa. Esa misma. Mira, busca la de esa la de retiro valores. Esa misma. Ya. Agrégate una columna porque no se no es visible.

**Cristian Huerta:** ¿A

**Charles Sepulveda:** Agrégate una columna. que se llama listas. Ahí está, ya está agregada la última. Cachá que aparece ahí en la columna listas. Yo agregué a la otra lista esa actividad.

**Cristian Huerta:** cuál? A

**Charles Sepulveda:** Sí,

**Cristian Huerta:** esa.

**Charles Sepulveda:** pues fíjate que la agregué ahí y tiene dice más uno al ladito. Mira,

**Cristian Huerta:** Sí, porque agregaste otra lista a

**Charles Sepulveda:** porque yo le agregué a la a la solicitud de retail.

**Cristian Huerta:** solicitudes.

**Charles Sepulveda:** Entonces, mira, agarra las otras tres y agrégala ahí a solicitud de R que está más arriba.

**Cristian Huerta:** Claro. Es lo mismo que la solicitud de R. Ahí te va a

**Charles Sepulveda:** Esa entonces ahora pertenece a a la lista aquí de autoplanes de ese proyecto

### 00:42:31

**Cristian Huerta:** aparecer

**Charles Sepulveda:** abierto y además la de solicitudes retail.

**Cristian Huerta:** y ahí por eso es lo

**Charles Sepulveda:** Ahora anda a la de al backlock de Roger,

**Cristian Huerta:** es más aparecieron,

**Charles Sepulveda:** mira.

**Cristian Huerta:** ¿viste?

**Charles Sepulveda:** Entonces ahora la ve el Roger porque está en solicitud de retail agregar como como una segunda lista sin sacarla de la lista original porque si no no las

**Cristian Huerta:** Por eso, te claro,

**Charles Sepulveda:** vemos.

**Cristian Huerta:** pero por eso te yo te hago un dashbo por acá aparte para que ustedes puedan ver lo que tienen asignado y que no están viendo en el otro con el otro para que no no anden perdiendo tiempo.

**Charles Sepulveda:** Pero, ¿cómo no vamos a perder tiempo? O sea, todo el mundo tiene como como lista oficial el otro.

**Cristian Huerta:** Sí, pero que se les pierden y están todos los días buscando y de repente nos atrasamos todos por buscar una una

**Charles Sepulveda:** Entonces,

**Cristian Huerta:** tarea hón, cachá. Entonces van a empezar a tomar tareas que no son, ¿cachá?

**Charles Sepulveda:** pero ahora entonces ahora ya si yo soy un de, ¿cuál es mi lista de backlock de has que tengo que atender?

**Cristian Huerta:** Hoy día, en este caso, según esta que viene, no sé si hay otra más de Roger, pero deberíais tomar esa que es urgente, obviamente después terminando esa que está la que estáis trabajando en progreso porque estáis con eso.

### 00:43:53

**Cristian Huerta:** Cach,

**Charles Sepulveda:** Sí, pues,

**Cristian Huerta:** debería ser esa que está en

**Charles Sepulveda:** pero es lo que su manualmente yo no hubiese

**Cristian Huerta:** progreso.

**Charles Sepulveda:** ido a rescatar esas cuatro que me dijeron, R ni se entera que tiene que hacer esa pega.

**Cristian Huerta:** Por eso,

**Charles Sepulveda:** p\*\*\*, entonces están creando por todos lados tarea y al final no nos llegan.

**Cristian Huerta:** por eso te digo, si lo que pasó ayer, las tareas que de P que no estaban viendo y por eso yo cuando mido lo

**Charles Sepulveda:** Vamos.

**Cristian Huerta:** que debe desarrollo retail, yo mido desarrollo retail todas las tareas, Charles, yo tengo miedo porque dice que hay 946 y de hecho te faltan 18 por estimar. Mira, y eso que no,

**Charles Sepulveda:** Están creando la tarea en cualquier parte.

**Cristian Huerta:** pero no, pero fíjate que en este caso están solamente desarrollo retail. Mira, yo tengo filtrado solo de desarrollo retail,

**Charles Sepulveda:** Espérate,

**Cristian Huerta:** ¿cachá? Entonces, por ejemplo, acá tengo varias sin estimar que yo no sé si son tuyas o no, pero están asignadas a ti. Mira que yo no sé si es momento, mira, esa atrasada 333 días.

**Charles Sepulveda:** ¿cuál es?

**Cristian Huerta:** Una de Autoplanet, cachá.

### 00:45:13

**Cristian Huerta:** Este tema desarrollo base requerimiento integración por Mercado Pago. Este lo pasé cuándo este,

**Charles Sepulveda:** Ha.

**Cristian Huerta:** pero ¿qué dice?

**Charles Sepulveda:** Estoy cargando esto. ¿Qué m\*\*\*\*\* graba DBS a cada rato como filtro?

**Cristian Huerta:** Ah, yo porque me llamó de hón porque hoy día

**Charles Sepulveda:** A cada rato lo quito y me lo graban de nuevo.

**Cristian Huerta:** grabé. Yo lo grabé porque justo me llamó Mancilla porque tiene altos temas atrasados y no le hemos dado

**Charles Sepulveda:** Ya,

**Cristian Huerta:** prioridad. Estáando todo el rato.

**Charles Sepulveda:** ya tú me decís que tenía un montón de

**Cristian Huerta:** Mira,

**Charles Sepulveda:** estimaciones.

**Cristian Huerta:** 18 sin estima. cachá.

**Charles Sepulveda:** 18 y

**Cristian Huerta:** Y solo del espacio es de desarrollo rit por eso,

**Charles Sepulveda:** dos.

**Cristian Huerta:** pero solo de desarrollo ritel, cachá. Buscar a todos los espacios. Célula web me aparecen 255, pero eso no es tuyo. Cach. Consultoría SAP hay 193\. Hay peores que tú,

**Charles Sepulveda:** No,

**Cristian Huerta:** cachá.

**Charles Sepulveda:** pero pero es que p\*\*\*

**Cristian Huerta:** Entonces,

**Charles Sepulveda:** 18\. Yo no veo 18 estimaciones pendientes. Tengo

**Cristian Huerta:** vamos a ver.

### 00:46:57

**Cristian Huerta:** Pues

**Charles Sepulveda:** tres.

**Cristian Huerta:** este está en solicitud de retail y está en pausa. Mira, por ejemplo, no está sin asignar, cachá. No está en una secuencia, pero nunca ha sido priorizada, nunca ha sido pesada.

**Charles Sepulveda:** Ya, pero espérate,

**Cristian Huerta:** Autoplan.

**Charles Sepulveda:** no tiene prioridad, no tiene ni una y el Sí,

**Cristian Huerta:** Ahí están sin prioridad. De hecho,

**Charles Sepulveda:** pero pero Cristian,

**Cristian Huerta:** me

**Charles Sepulveda:** lo que pasa es que habíamos oficializado una lista a no estar mirando en todos lados.

**Cristian Huerta:** Pero que si esa lista se les pierde, Chal, si no no están viendo,

**Charles Sepulveda:** Ya,

**Cristian Huerta:** por ejemplo,

**Charles Sepulveda:** pero es que no están bien definidos, pues. Tú viste, me están creando actividades listas que están por fuera, no comparten a la lista. oficial y ahora estoy viendo que ahí hay tareas que han estimado que no tienen no tienen eh eh por ejemplo la prioridad porque la lista oficial que tenemos te filtra por

**Cristian Huerta:** Claro, pero acá hay otras que esta está con prioridad,

**Charles Sepulveda:** prioridad.

**Cristian Huerta:** no sé por qué no está estimada. Por ejemplo, boletas fantasmas de C Beauty.

**Charles Sepulveda:** Ah, pero es que esas sí aparecen, pero estamos a la espera de la otra huevada.

**Cristian Huerta:** Cachá, pero esta, pero esta no está estimada, pues.

### 00:48:24

**Cristian Huerta:** Y por ejemplo ahí est yo te pía que por último la estimen por último para saber cuándo meterle y saber ya esta no poder meter nunca porque estimaste 100 horas y no te puedo robar 100 horas.

**Charles Sepulveda:** No, pero ya, pero espérate,

**Cristian Huerta:** Pues

**Charles Sepulveda:** si ya se hizo un desarrollo que se tiene que implementar, ¿qué tengo que hacer yo con esa tarea?

**Cristian Huerta:** hoy día que yo le que le dije a a David, hoy día yo no tengo esta certeza que yo lo puedo implementar. Hoy día lo fueron a implementar con un cliente y no pudieron implementarlo porque el Jermin me dice,

**Charles Sepulveda:** Да,

**Cristian Huerta:** "¿Sabes qué? No está registrando lo que dice la documentación que tenía que dejar el tema." Y después David revisó y me dijo, "No, es que hay un tema con las tramas que no están las tramas. No tengo idea. No tengo la certeza de las versiones." Pues cachá. Este era el mismo requerimiento original. Cachá. Y este recuerda que es 114\. Yo no sé si aplica lo mismo que para 2.5 donde lo hicieron o 2.2.

**Charles Sepulveda:** M. Está difícil ahí. Yo creo que va a quedar la c\*\*\*\*\*

**Cristian Huerta:** Cacha,

**Charles Sepulveda:** si llegan y lo implementan el otro. No, hay que

**Cristian Huerta:** cachá.

**Charles Sepulveda:** separarlo.

**Cristian Huerta:** Pero eso v sirve el este y échele una vida. Yo tendría una reunión ahora. Me están esperando a las 3:30,

**Charles Sepulveda:** Una sesión de trabajo con es boletas fantasmas de consult.

**Cristian Huerta:** pero eso ya te dejo.

**Charles Sepulveda:** Ya seguir revisando.

**Cristian Huerta:** Me voy a la re. Vale,

**Charles Sepulveda:** Hablamos.

**Cristian Huerta:** gracias. Ch. ¿Quién una reunión ahora? Perdón, estaba con en reunión

### La transcripción finalizó después de 00:50:14

*Esta transcripción editable se generó por computadora y puede contener errores. Los usuarios también pueden cambiar el texto después de que se cree.*