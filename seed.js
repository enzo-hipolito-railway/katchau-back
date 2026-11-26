// Cria categorias, produtos, imagens e estoque de teste direto no banco.
// Nao apaga nada: produtos com codigo ja existente sao ignorados.
// Imagens: Wikimedia Commons (licencas livres).
const db = require('./config/db')
const { Categoria, Produto, ProdutoImagem, Estoque } = require('./models')

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb/'

const catalogo = [
    {
        categoria: {nome: 'Placas de Video', descricao: 'Placas de video para jogos e trabalho'},
        produtos: [
            {
                codigo: 'GPU-001',
                nome: 'Placa de Video GeForce RTX 5060 Ti 16GB Dual Fan',
                descricao: 'Placa de video NVIDIA RTX 5060 Ti com 16GB GDDR7, DLSS 4 e Ray Tracing. Ideal para jogos em 1440p.',
                preco: 3299.90,
                imagens: [
                    W + 'c/cd/Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_front.jpg/960px-Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_front.jpg',
                    W + 'c/cf/Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_rear.jpg/960px-Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_rear.jpg'
                ]
            },
            {
                codigo: 'GPU-002',
                nome: 'Placa de Video Radeon RX 7900 XT 20GB',
                descricao: 'Placa de video AMD Radeon RX 7900 XT com 20GB GDDR6 e cooler triplo. Desempenho para jogos em 4K.',
                preco: 5499.90,
                imagens: [
                    W + 'a/a0/7900XT_1.jpg/960px-7900XT_1.jpg',
                    W + '9/91/7900XT_2.jpg/960px-7900XT_2.jpg'
                ]
            },
            {
                codigo: 'GPU-003',
                nome: 'Placa de Video Radeon RX 560 4GB',
                descricao: 'Placa de video de entrada AMD Radeon RX 560 com 4GB GDDR5. Saidas HDMI, DisplayPort e DVI.',
                preco: 649.90,
                imagens: [
                    W + 'b/b5/Sapphire_Radeon_RX_560_4G_GDDR5_20250830_HOF4259-HDR_RAW-Export.png/960px-Sapphire_Radeon_RX_560_4G_GDDR5_20250830_HOF4259-HDR_RAW-Export.png',
                    W + 'c/cd/Sapphire_Radeon_RX_560_4G_GDDR5_20250830_HOF4265_RAW-Export.png/960px-Sapphire_Radeon_RX_560_4G_GDDR5_20250830_HOF4265_RAW-Export.png'
                ]
            }
        ]
    },
    {
        categoria: {nome: 'Fones de Ouvido', descricao: 'Fones de ouvido e headsets'},
        produtos: [
            {
                codigo: 'FONE-001',
                nome: 'Fone de Ouvido Sennheiser HD 800 S',
                descricao: 'Fone over-ear aberto de alta fidelidade, com drivers de 56mm e palco sonoro amplo.',
                preco: 9999.90,
                imagens: [
                    W + '3/30/Sennheiser_HD800S.jpg/960px-Sennheiser_HD800S.jpg',
                    W + '4/4e/Sennheiser_HD800S_%28alternate_view%29.jpg/960px-Sennheiser_HD800S_%28alternate_view%29.jpg'
                ]
            },
            {
                codigo: 'FONE-002',
                nome: 'Fone de Ouvido AudioQuest NightHawk Carbon',
                descricao: 'Fone over-ear semiaberto com conchas de material biocomposito e almofadas de couro sintetico.',
                preco: 3499.90,
                imagens: [
                    W + '2/20/AudioQuest_NightHawk_Carbon_headphones_%2834424584065%29.jpg/960px-AudioQuest_NightHawk_Carbon_headphones_%2834424584065%29.jpg',
                    W + '1/1d/AudioQuest_NightHawk_Carbon_headphones_%2833582571334%29.jpg/960px-AudioQuest_NightHawk_Carbon_headphones_%2833582571334%29.jpg'
                ]
            },
            {
                codigo: 'FONE-003',
                nome: 'Fone de Ouvido Studio Sennheiser HD Series',
                descricao: 'Fone over-ear para estudio e uso diario, com cabo removivel e otimo isolamento.',
                preco: 1299.90,
                imagens: [
                    W + '4/41/Sennheiser_HD650_headphones.jpg/960px-Sennheiser_HD650_headphones.jpg',
                    W + '2/28/Sennheiser-HD280pro-headphones.jpg/960px-Sennheiser-HD280pro-headphones.jpg'
                ]
            }
        ]
    },
    {
        categoria: {nome: 'Teclados', descricao: 'Teclados mecanicos, gamer e de escritorio'},
        produtos: [
            {
                codigo: 'TEC-001',
                nome: 'Teclado Gamer Logitech G PRO TKL',
                descricao: 'Teclado mecanico gamer tenkeyless com iluminacao RGB LIGHTSYNC e switches GX.',
                preco: 899.90,
                imagens: [
                    W + '5/50/Logitech_G_PRO_TKL_gaming_keyboard_-_English_%28United_States%29_layout.jpg/960px-Logitech_G_PRO_TKL_gaming_keyboard_-_English_%28United_States%29_layout.jpg',
                    W + '5/54/Logitech_Gaming-Keyboard_G15.jpg/960px-Logitech_Gaming-Keyboard_G15.jpg'
                ]
            },
            {
                codigo: 'TEC-002',
                nome: 'Teclado Gamer Razer Ornata Chroma',
                descricao: 'Teclado gamer mecha-membrana com iluminacao Razer Chroma RGB e apoio de pulso.',
                preco: 549.90,
                imagens: [
                    W + 'e/e2/Razer_Ornata_Chroma_keyboard-top_PNr%C2%B00463.jpg/960px-Razer_Ornata_Chroma_keyboard-top_PNr%C2%B00463.jpg',
                    W + '7/78/Razer_Arctosa_keyboard-top-ar_16to9_PNr%C2%B00325.jpg/960px-Razer_Arctosa_keyboard-top-ar_16to9_PNr%C2%B00325.jpg'
                ]
            },
            {
                codigo: 'TEC-003',
                nome: 'Teclado Mecanico RGB TKL Switch Blue',
                descricao: 'Teclado mecanico compacto com corpo em aluminio, switches blue e iluminacao RGB.',
                preco: 249.90,
                imagens: [
                    W + '6/68/Lingbao_JIGUANSHI_Mechanical_Gaming_Keyboard.jpg/960px-Lingbao_JIGUANSHI_Mechanical_Gaming_Keyboard.jpg',
                    W + '7/7f/Beautiful_Mechanical_Keyboard.jpg/960px-Beautiful_Mechanical_Keyboard.jpg'
                ]
            }
        ]
    },
    {
        categoria: {nome: 'Mouses', descricao: 'Mouses gamer e de escritorio'},
        produtos: [
            {
                codigo: 'MOU-001',
                nome: 'Mouse Gamer Razer DeathAdder',
                descricao: 'Mouse gamer ergonomico com sensor optico de alta precisao e iluminacao verde.',
                preco: 249.90,
                imagens: [
                    W + '1/19/Razer_DeathAdder_2013_Edition-front_oblique-ar_16to10-fs_PNr%C2%B00400.jpg/960px-Razer_DeathAdder_2013_Edition-front_oblique-ar_16to10-fs_PNr%C2%B00400.jpg',
                    W + '9/90/Razer_DeathAdder_2013_Edition-mouse_wheel_PNr%C2%B00405.jpg/960px-Razer_DeathAdder_2013_Edition-mouse_wheel_PNr%C2%B00405.jpg'
                ]
            },
            {
                codigo: 'MOU-002',
                nome: 'Mouse Gamer Razer Naga MMO 12 Botoes',
                descricao: 'Mouse gamer para MMO com 12 botoes laterais programaveis e iluminacao RGB.',
                preco: 399.90,
                imagens: [
                    W + '6/69/Razer_Naga_Classic.jpg/960px-Razer_Naga_Classic.jpg',
                    W + '8/8e/Razer_Naga_Molten_side_on.jpg/960px-Razer_Naga_Molten_side_on.jpg'
                ]
            },
            {
                codigo: 'MOU-003',
                nome: 'Mouse Gamer Sem Fio Logitech G903 Lightspeed',
                descricao: 'Mouse gamer sem fio com tecnologia Lightspeed, sensor HERO e bateria de longa duracao.',
                preco: 699.90,
                imagens: [
                    W + '7/71/2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg/960px-2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg',
                    W + 'c/c9/Logitech%28G703%29_mouse.jpg/960px-Logitech%28G703%29_mouse.jpg'
                ]
            }
        ]
    },
    {
        categoria: {nome: 'Monitores', descricao: 'Monitores para jogos e escritorio'},
        produtos: [
            {
                codigo: 'MON-001',
                nome: 'Monitor Gamer Curvo Super Ultrawide 49"',
                descricao: 'Monitor curvo 32:9 de 49 polegadas, 144Hz e HDR. Equivale a dois monitores de 27".',
                preco: 6999.90,
                imagens: [
                    W + '6/6e/Samsung_Monitor_1_2018-11-19.jpg/960px-Samsung_Monitor_1_2018-11-19.jpg',
                    W + '0/08/Gaming-Monitor_ausgestellt_20190202_185511_Kopie.jpg/960px-Gaming-Monitor_ausgestellt_20190202_185511_Kopie.jpg'
                ]
            },
            {
                codigo: 'MON-002',
                nome: 'Monitor Samsung 22" LCD Widescreen',
                descricao: 'Monitor LCD de 22 polegadas com suporte VESA, ideal para escritorio e estudos.',
                preco: 699.90,
                imagens: [
                    W + '2/24/Computer_monitor_samsung.jpg/960px-Computer_monitor_samsung.jpg',
                    W + 'f/fa/Samsung_monitor_with_VESA_mount.jpg/960px-Samsung_monitor_with_VESA_mount.jpg'
                ]
            },
            {
                codigo: 'MON-003',
                nome: 'Monitor Dell UltraSharp 24"',
                descricao: 'Monitor Dell com base ajustavel em altura e inclinacao, cores precisas e bordas finas.',
                preco: 1499.90,
                imagens: [
                    W + 'e/e1/Dell_Computer_Monitor.png/960px-Dell_Computer_Monitor.png',
                    W + 'b/b4/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg/960px-Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg'
                ]
            }
        ]
    }
]

async function criarProduto({imagens, ...dados}, categoria_id){
    return db.transaction(async (transaction) => {
        const [produto, criado] = await Produto.findOrCreate({
            where: {codigo: dados.codigo},
            defaults: {...dados, categoria_id},
            transaction
        })

        if(!criado) return false

        await ProdutoImagem.bulkCreate(
            imagens.map((url, ordem) => ({produto_id: produto.id, url, ordem})),
            {transaction, validate: true}
        )
        await Estoque.create(
            {produto_id: produto.id, quantidade: 50, quantidade_minima: 5, ultima_movimentacao: new Date()},
            {transaction}
        )

        return true
    })
}

async function seed(){
    try{
        // Sem force: apenas cria as tabelas que ainda nao existem.
        await db.sync()

        let criados = 0
        let ignorados = 0

        for(const {categoria, produtos} of catalogo){
            const [registro] = await Categoria.findOrCreate({
                where: {nome: categoria.nome},
                defaults: categoria
            })

            for(const dados of produtos){
                if(await criarProduto(dados, registro.id)){
                    criados++
                    console.log(`Criado: ${dados.codigo} - ${dados.nome}`)
                }
                else{
                    ignorados++
                    console.log(`Ja existia: ${dados.codigo}`)
                }
            }
        }

        console.log(`Seed concluido! ${criados} produto(s) criado(s), ${ignorados} ignorado(s).`)
    }
    catch(err){
        console.error('Falha ao popular o banco de dados!', err)
        process.exitCode = 1
    }
    finally{
        await db.close()
    }
}

seed()
