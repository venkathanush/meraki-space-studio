// Three.js Interactive 3D Hero Scene for Meraki Space Studio
// Dark Luxury Aesthetic - Interactive Interior Space

class MerakiHero3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.init();
        this.createScene();
        this.createRoom();
        this.createFurniture();
        this.createLighting();
        this.createParticles();
        this.setupInteraction();
        this.animate();
        this.handleResize();
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 1.6, 6);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 12;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.minPolarAngle = 0.15;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.15;

        // Clock
        this.clock = new THREE.Clock();
        this.time = 0;

        // Mouse tracking for parallax
        this.mouse = new THREE.Vector2(0, 0);
        this.targetRotation = new THREE.Euler(0, 0, 0);
    }

    createScene() {
        // Environment map for reflections
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const envTexture = new THREE.TextureLoader().load(
            'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                this.scene.environment = pmremGenerator.fromEquirectangular(texture).texture;
                this.scene.background = this.scene.environment;
            }
        );
    }

    createRoom() {
        const roomGroup = new THREE.Group();
        roomGroup.name = 'room';

        // Materials - Dark luxury palette
        const wallMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x12100e,
            roughness: 0.85,
            metalness: 0.05,
            clearcoat: 0.1,
            clearcoatRoughness: 0.3
        });

        const floorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1612,
            roughness: 0.3,
            metalness: 0.1,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2
        });

        const ceilingMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0d0c0a,
            roughness: 0.9,
            metalness: 0.02
        });

        const trimMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc19a6b,
            roughness: 0.3,
            metalness: 0.7,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a2e,
            roughness: 0.05,
            metalness: 0.9,
            transmission: 0.85,
            thickness: 0.5,
            ior: 1.5,
            envMapIntensity: 1.5
        });

        // Floor
        const floorGeo = new THREE.BoxGeometry(16, 0.15, 16);
        const floor = new THREE.Mesh(floorGeo, floorMaterial);
        floor.position.y = -0.075;
        floor.receiveShadow = true;
        roomGroup.add(floor);

        // Floor inlay pattern
        const inlayGeo = new THREE.RingGeometry(2.5, 3.2, 32);
        const inlayMat = new THREE.MeshPhysicalMaterial({
            color: 0xc19a6b,
            roughness: 0.2,
            metalness: 0.6,
            side: THREE.DoubleSide
        });
        const inlay = new THREE.Mesh(inlayGeo, inlayMat);
        inlay.rotation.x = -Math.PI / 2;
        inlay.position.y = 0.01;
        roomGroup.add(inlay);

        // Walls
        const wallGeo = new THREE.BoxGeometry(16, 6, 0.2);
        
        // Back wall
        const backWall = new THREE.Mesh(wallGeo, wallMaterial);
        backWall.position.set(0, 2.9, -7.9);
        backWall.receiveShadow = true;
        roomGroup.add(backWall);

        // Side walls
        const sideWallGeo = new THREE.BoxGeometry(0.2, 6, 16);
        const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
        leftWall.position.set(-7.9, 2.9, 0);
        leftWall.receiveShadow = true;
        roomGroup.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
        rightWall.position.set(7.9, 2.9, 0);
        rightWall.receiveShadow = true;
        roomGroup.add(rightWall);

        // Ceiling
        const ceilingGeo = new THREE.BoxGeometry(16, 0.2, 16);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
        ceiling.position.y = 5.9;
        roomGroup.add(ceiling);

        // Ceiling cove lighting
        const coveGeo = new THREE.BoxGeometry(14, 0.15, 0.15);
        const coveMat = new THREE.MeshBasicMaterial({ color: 0xffd4a3 });
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -1; z <= 1; z += 2) {
                const cove = new THREE.Mesh(coveGeo, coveMat);
                cove.position.set(x * 6.5, 5.8, z * 6.5);
                cove.rotation.y = z === -1 ? Math.PI : 0;
                roomGroup.add(cove);
            }
        }

        // Trim / Baseboards
        const trimGeo = new THREE.BoxGeometry(16, 0.12, 0.08);
        const baseboard = new THREE.Mesh(trimGeo, trimMaterial);
        baseboard.position.set(0, 0.06, -7.9);
        roomGroup.add(baseboard);

        const baseboard2 = new THREE.Mesh(trimGeo, trimMaterial);
        baseboard2.position.set(0, 0.06, 7.9);
        roomGroup.add(baseboard2);

        // Crown molding
        const crownGeo = new THREE.BoxGeometry(16, 0.1, 0.1);
        const crown = new THREE.Mesh(crownGeo, trimMaterial);
        crown.position.set(0, 5.85, -7.9);
        roomGroup.add(crown);

        // Large window on back wall
        const windowFrameGeo = new THREE.BoxGeometry(5, 3.5, 0.1);
        const windowFrame = new THREE.Mesh(windowFrameGeo, trimMaterial);
        windowFrame.position.set(0, 3.2, -7.85);
        roomGroup.add(windowFrame);

        const windowGlassGeo = new THREE.PlaneGeometry(4.6, 3.1);
        const windowGlass = new THREE.Mesh(windowGlassGeo, glassMaterial);
        windowGlass.position.set(0, 3.2, -7.8);
        windowGlass.rotation.y = Math.PI;
        roomGroup.add(windowGlass);

        // Window mullions
        const mullionGeo = new THREE.BoxGeometry(0.05, 3.1, 0.12);
        for (let i = -1; i <= 1; i++) {
            const mullion = new THREE.Mesh(mullionGeo, trimMaterial);
            mullion.position.set(i * 1.5, 3.2, -7.82);
            roomGroup.add(mullion);
        }

        this.scene.add(roomGroup);
        this.roomGroup = roomGroup;
    }

    createFurniture() {
        const furnitureGroup = new THREE.Group();
        furnitureGroup.name = 'furniture';

        // Materials
        const woodMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2d241c,
            roughness: 0.6,
            metalness: 0.05,
            clearcoat: 0.2,
            clearcoatRoughness: 0.3
        });

        const walnutMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x3d2914,
            roughness: 0.5,
            metalness: 0.08,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2
        });

        const brassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc19a6b,
            roughness: 0.25,
            metalness: 0.85,
            clearcoat: 0.4,
            clearcoatRoughness: 0.1
        });

        const leatherMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1510,
            roughness: 0.7,
            metalness: 0.05,
            clearcoat: 0.15,
            clearcoatRoughness: 0.4
        });

        const fabricMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2520,
            roughness: 0.85,
            metalness: 0.02
        });

        const marbleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1e1a16,
            roughness: 0.15,
            metalness: 0.05,
            clearcoat: 0.8,
            clearcoatRoughness: 0.05
        });

        // ========== SOFA ==========
        const sofaGroup = new THREE.Group();
        
        // Sofa base
        const sofaBaseGeo = new THREE.BoxGeometry(3.2, 0.45, 1.1);
        const sofaBase = new THREE.Mesh(sofaBaseGeo, walnutMaterial);
        sofaBase.position.set(-3.5, 0.225, -1.5);
        sofaBase.castShadow = true;
        sofaBase.receiveShadow = true;
        sofaGroup.add(sofaBase);

        // Sofa seat cushion
        const seatGeo = new THREE.BoxGeometry(3.0, 0.18, 1.0);
        const seat = new THREE.Mesh(seatGeo, leatherMaterial);
        seat.position.set(-3.5, 0.55, -1.5);
        seat.castShadow = true;
        sofaGroup.add(seat);

        // Sofa back
        const backGeo = new THREE.BoxGeometry(3.2, 0.8, 0.15);
        const back = new THREE.Mesh(backGeo, leatherMaterial);
        back.position.set(-3.5, 1.0, -2.0);
        back.castShadow = true;
        sofaGroup.add(back);

        // Sofa arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.6, 1.1);
        const leftArm = new THREE.Mesh(armGeo, leatherMaterial);
        leftArm.position.set(-5.1, 0.55, -1.5);
        leftArm.castShadow = true;
        sofaGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, leatherMaterial);
        rightArm.position.set(-1.9, 0.55, -1.5);
        rightArm.castShadow = true;
        sofaGroup.add(rightArm);

        // Brass legs
        const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8);
        for (let x of [-4.9, -2.1]) {
            for (let z of [-2.0, -1.0]) {
                const leg = new THREE.Mesh(legGeo, brassMaterial);
                leg.position.set(x, 0.1, z);
                leg.castShadow = true;
                sofaGroup.add(leg);
            }
        }

        furnitureGroup.add(sofaGroup);

        // ========== ARMCHAIRS (Pair) ==========
        for (let side of [-1, 1]) {
            const chairGroup = new THREE.Group();
            
            const chairBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.85, 0.42, 0.85),
                walnutMaterial
            );
            chairBase.position.set(side * 3.5, 0.21, 1.8);
            chairBase.castShadow = true;
            chairGroup.add(chairBase);

            const chairSeat = new THREE.Mesh(
                new THREE.BoxGeometry(0.75, 0.12, 0.75),
                leatherMaterial
            );
            chairSeat.position.set(side * 3.5, 0.5, 1.8);
            chairSeat.castShadow = true;
            chairGroup.add(chairSeat);

            const chairBack = new THREE.Mesh(
                new THREE.BoxGeometry(0.75, 0.6, 0.12),
                leatherMaterial
            );
            chairBack.position.set(side * 3.5, 0.85, 2.2);
            chairBack.castShadow = true;
            chairGroup.add(chairBack);

            // Brass legs
            for (let lx of [-0.3, 0.3]) {
                for (let lz of [-0.3, 0.3]) {
                    const leg = new THREE.Mesh(legGeo, brassMaterial);
                    leg.position.set(side * 3.5 + lx, 0.1, 1.8 + lz);
                    leg.castShadow = true;
                    chairGroup.add(leg);
                }
            }

            furnitureGroup.add(chairGroup);
        }

        // ========== COFFEE TABLE ==========
        const tableGroup = new THREE.Group();
        
        // Table top - marble
        const tableTopGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.06, 32);
        const tableTop = new THREE.Mesh(tableTopGeo, marbleMaterial);
        tableTop.position.set(-3.5, 0.45, -0.2);
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);

        // Table base - brass sculptural
        const baseGeo = new THREE.CylinderGeometry(0.12, 0.25, 0.4, 8);
        const tableBase = new THREE.Mesh(baseGeo, brassMaterial);
        tableBase.position.set(-3.5, 0.2, -0.2);
        tableBase.castShadow = true;
        tableGroup.add(tableBase);

        // Decorative objects on table
        const bookGeo = new THREE.BoxGeometry(0.25, 0.02, 0.18);
        const bookMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1510, roughness: 0.8 });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(-3.3, 0.5, -0.1);
        book.rotation.y = 0.3;
        tableGroup.add(book);

        const vaseGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.2, 16);
        const vaseMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x3a3530, 
            roughness: 0.4, 
            metalness: 0.2 
        });
        const vase = new THREE.Mesh(vaseGeo, vaseMat);
        vase.position.set(-3.7, 0.55, -0.15);
        tableGroup.add(vase);

        furnitureGroup.add(tableGroup);

        // ========== SIDE TABLE ==========
        const sideTableGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.55, 16);
        const sideTable = new THREE.Mesh(sideTableGeo, walnutMaterial);
        sideTable.position.set(-5.2, 0.275, 1.8);
        sideTable.castShadow = true;
        furnitureGroup.add(sideTable);

        // Table lamp
        const lampBaseGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.15, 16);
        const lampBase = new THREE.Mesh(lampBaseGeo, brassMaterial);
        lampBase.position.set(-5.2, 0.65, 1.8);
        furnitureGroup.add(lampBase);

        const lampStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8);
        const lampStem = new THREE.Mesh(lampStemGeo, brassMaterial);
        lampStem.position.set(-5.2, 0.95, 1.8);
        furnitureGroup.add(lampStem);

        const shadeGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.15, 16);
        const shadeMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x2a2520, 
            roughness: 0.8,
            transmission: 0.1 
        });
        const shade = new THREE.Mesh(shadeGeo, shadeMat);
        shade.position.set(-5.2, 1.15, 1.8);
        furnitureGroup.add(shade);

        // ========== FLOOR LAMP ==========
        const floorLampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16),
            brassMaterial
        );
        floorLampBase.position.set(4.5, 0.015, -2.5);
        furnitureGroup.add(floorLampBase);

        const floorLampStem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 1.6, 8),
            brassMaterial
        );
        floorLampStem.position.set(4.5, 0.83, -2.5);
        furnitureGroup.add(floorLampStem);

        const floorLampArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.012, 0.012),
            brassMaterial
        );
        floorLampArm.position.set(4.2, 1.6, -2.5);
        furnitureGroup.add(floorLampArm);

        const floorLampShade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.12, 0.18, 16),
            shadeMat
        );
        floorLampShade.position.set(3.85, 1.6, -2.5);
        furnitureGroup.add(floorLampShade);

        // Store lamp references for animation
        this.tableLampShade = shade;
        this.floorLampShade = floorLampShade;

        // ========== SHELVING UNIT ==========
        const shelfGroup = new THREE.Group();
        
        for (let i = 0; i < 4; i++) {
            const shelfGeo = new THREE.BoxGeometry(2.5, 0.04, 0.35);
            const shelf = new THREE.Mesh(shelfGeo, walnutMaterial);
            shelf.position.set(5.5, 1.0 + i * 1.1, -4.5);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            shelfGroup.add(shelf);

            // Books on shelves
            for (let b = 0; b < 3; b++) {
                const bookW = 0.15 + Math.random() * 0.1;
                const bookH = 0.18 + Math.random() * 0.1;
                const bookD = 0.15;
                const bookGeo = new THREE.BoxGeometry(bookW, bookH, bookD);
                const bookColors = [0x1a1510, 0x2d241c, 0x3d2914, 0x4a3728];
                const bookMat = new THREE.MeshPhysicalMaterial({ 
                    color: bookColors[Math.floor(Math.random() * bookColors.length)],
                    roughness: 0.8
                });
                const bookMesh = new THREE.Mesh(bookGeo, bookMat);
                bookMesh.position.set(
                    5.5 - 1.0 + b * 0.65,
                    1.0 + i * 1.1 + bookH / 2 + 0.02,
                    -4.5
                );
                shelfGroup.add(bookMesh);
            }
        }

        // Shelf verticals
        const vertGeo = new THREE.BoxGeometry(0.04, 4.5, 0.35);
        const leftVert = new THREE.Mesh(vertGeo, walnutMaterial);
        leftVert.position.set(4.25, 2.8, -4.5);
        shelfGroup.add(leftVert);

        const rightVert = new THREE.Mesh(vertGeo, walnutMaterial);
        rightVert.position.set(6.75, 2.8, -4.5);
        shelfGroup.add(rightVert);

        furnitureGroup.add(shelfGroup);

        // ========== RUG ==========
        const rugGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.02, 32);
        const rugMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1612,
            roughness: 0.95,
            metalness: 0.0
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.position.set(-3.5, 0.08, -0.2);
        rug.receiveShadow = true;
        furnitureGroup.add(rug);

        // Rug pattern
        const patternGeo = new THREE.RingGeometry(1.8, 2.0, 64);
        const patternMat = new THREE.MeshPhysicalMaterial({
            color: 0x2a2520,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        const pattern = new THREE.Mesh(patternGeo, patternMat);
        pattern.rotation.x = -Math.PI / 2;
        pattern.position.set(-3.5, 0.09, -0.2);
        furnitureGroup.add(pattern);

        this.scene.add(furnitureGroup);
        this.furnitureGroup = furnitureGroup;
    }

    createLighting() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x2a2520, 0.4);
        this.scene.add(ambient);

        // Main directional - sun through window
        this.sunLight = new THREE.DirectionalLight(0xffd4a3, 2.5);
        this.sunLight.position.set(0, 5, -10);
        this.sunLight.target.position.set(0, 1, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 20;
        this.sunLight.shadow.camera.left = -8;
        this.sunLight.shadow.camera.right = 8;
        this.sunLight.shadow.camera.top = 8;
        this.sunLight.shadow.camera.bottom = -8;
        this.sunLight.shadow.bias = -0.0005;
        this.sunLight.shadow.normalBias = 0.02;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        // Warm fill from cove
        const coveLight1 = new THREE.SpotLight(0xffd4a3, 1.5);
        coveLight1.position.set(-6.5, 5.7, -6.5);
        coveLight1.target.position.set(-4, 1, -4);
        coveLight1.angle = Math.PI / 4;
        coveLight1.penumbra = 0.5;
        coveLight1.decay = 1.5;
        coveLight1.distance = 10;
        coveLight1.castShadow = true;
        this.scene.add(coveLight1);
        this.scene.add(coveLight1.target);

        const coveLight2 = new THREE.SpotLight(0xffd4a3, 1.5);
        coveLight2.position.set(6.5, 5.7, -6.5);
        coveLight2.target.position.set(4, 1, -4);
        coveLight2.angle = Math.PI / 4;
        coveLight2.penumbra = 0.5;
        coveLight2.decay = 1.5;
        coveLight2.distance = 10;
        coveLight2.castShadow = true;
        this.scene.add(coveLight2);
        this.scene.add(coveLight2.target);

        // Accent lights on furniture
        this.tableLampLight = new THREE.SpotLight(0xffd4a3, 1.2);
        this.tableLampLight.position.set(-5.2, 1.2, 1.8);
        this.tableLampLight.target.position.set(-5.2, 0.5, 1.8);
        this.tableLampLight.angle = Math.PI / 3;
        this.tableLampLight.penumbra = 0.6;
        this.tableLampLight.decay = 2;
        this.tableLampLight.distance = 3;
        this.scene.add(this.tableLampLight);
        this.scene.add(this.tableLampLight.target);

        this.floorLampLight = new THREE.SpotLight(0xffd4a3, 1.0);
        this.floorLampLight.position.set(3.85, 1.7, -2.5);
        this.floorLampLight.target.position.set(3.85, 0.5, -2.5);
        this.floorLampLight.angle = Math.PI / 3;
        this.floorLampLight.penumbra = 0.6;
        this.floorLampLight.decay = 2;
        this.floorLampLight.distance = 3;
        this.scene.add(this.floorLampLight);
        this.scene.add(this.floorLampLight.target);

        // Subtle rim light
        const rimLight = new THREE.DirectionalLight(0x3a3028, 0.5);
        rimLight.position.set(0, -2, 10);
        this.scene.add(rimLight);
    }

    createParticles() {
        // Dust motes / atmospheric particles
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 1] = Math.random() * 5.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
            
            sizes[i] = Math.random() * 2 + 0.5;
            alphas[i] = Math.random() * 0.4 + 0.1;
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.0005;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.0002;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0005;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        const material = new THREE.PointsMaterial({
            color: 0xffd4a3,
            size: 1,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.particleVelocities = velocities;
        this.scene.add(this.particles);
    }

    setupInteraction() {
        // Mouse move parallax
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Touch support
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        // Scroll interaction
        let scrollY = 0;
        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const progress = Math.min(scrollY / maxScroll, 1);
            
            // Camera moves down and rotates slightly on scroll
            this.camera.position.y = 1.6 + progress * 1.5;
            this.camera.position.z = 6 + progress * 2;
            this.controls.target.y = 1.0 + progress * 0.5;
        }, { passive: true });

        // Click to focus on furniture
        this.raycaster = new THREE.Raycaster();
        this.canvas.addEventListener('click', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.furnitureGroup.children, true);
            
            if (intersects.length > 0) {
                const target = intersects[0].object;
                // Find top-level furniture piece
                let parent = target;
                while (parent.parent && parent.parent !== this.furnitureGroup) {
                    parent = parent.parent;
                }
                
                // Animate camera to focus
                const box = new THREE.Box3().setFromObject(parent);
                const center = new THREE.Vector3();
                box.getCenter(center);
                
                this.animateCameraTo(center.clone().add(new THREE.Vector3(0, 0.5, 2)));
            }
        });
    }

    animateCameraTo(targetPosition) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1.5;
        const startTime = this.time;
        
        const animate = () => {
            const elapsed = this.time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            
            this.camera.position.lerpVectors(startPos, targetPosition, eased);
            this.controls.target.lerpVectors(startTarget, targetPosition.clone().setY(1), eased);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.controls.autoRotate = true;
            }
        };
        
        this.controls.autoRotate = false;
        animate();
    }

    animate() {
        this.time = this.clock.getElapsedTime();
        
        // Update controls
        this.controls.update();

        // Subtle camera drift based on mouse
        this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.01;
        this.camera.position.y += (this.mouse.y * 0.2 + 1.6 - this.camera.position.y) * 0.01;

        // Animate lights - subtle breathing
        if (this.sunLight) {
            this.sunLight.intensity = 2.5 + Math.sin(this.time * 0.5) * 0.15;
        }

        // Animate lamp lights
        if (this.tableLampLight) {
            this.tableLampLight.intensity = 1.2 + Math.sin(this.time * 2.3) * 0.08;
        }
        if (this.floorLampLight) {
            this.floorLampLight.intensity = 1.0 + Math.sin(this.time * 1.7 + 1) * 0.06;
        }

        // Animate lamp shades glow
        if (this.tableLampShade) {
            this.tableLampShade.material.emissive = new THREE.Color(0xffd4a3);
            this.tableLampShade.material.emissiveIntensity = 0.15 + Math.sin(this.time * 2.3) * 0.05;
        }
        if (this.floorLampShade) {
            this.floorLampShade.material.emissive = new THREE.Color(0xffd4a3);
            this.floorLampShade.material.emissiveIntensity = 0.12 + Math.sin(this.time * 1.7) * 0.04;
        }

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += this.particleVelocities[i];
                positions[i + 1] += this.particleVelocities[i + 1];
                positions[i + 2] += this.particleVelocities[i + 2];

                // Wrap around
                if (positions[i] > 7) positions[i] = -7;
                if (positions[i] < -7) positions[i] = 7;
                if (positions[i + 1] > 5.5) positions[i + 1] = 0;
                if (positions[i + 1] < 0) positions[i + 1] = 5.5;
                if (positions[i + 2] > 7) positions[i + 2] = -7;
                if (positions[i + 2] < -7) positions[i + 2] = 7;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // Rotate particle system slowly
            this.particles.rotation.y += 0.00005;
        }

        // Subtle furniture breathing
        if (this.furnitureGroup) {
            this.furnitureGroup.rotation.y = Math.sin(this.time * 0.08) * 0.008;
        }

        // Room subtle movement
        if (this.roomGroup) {
            this.roomGroup.position.y = Math.sin(this.time * 0.3) * 0.01;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Load Three.js and OrbitControls from CDN
    const loadScript = (src) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js')
    ]).then(() => {
        // Small delay to ensure canvas is ready
        setTimeout(() => {
            window.merakiHero3D = new MerakiHero3D('hero-canvas');
        }, 100);
    }).catch(err => {
        console.warn('Three.js failed to load, falling back to static hero:', err);
        // Fallback: show static hero image
        const canvas = document.getElementById('hero-canvas');
        if (canvas) {
            canvas.style.display = 'none';
            const fallback = document.getElementById('hero-fallback');
            if (fallback) fallback.style.display = 'block';
        }
    });
});

// Reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
}