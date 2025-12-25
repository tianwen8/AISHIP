ideos> npm run dev

> ai-video-saas@0.1.0 dev
> next dev

   ▲ Next.js 15.5.5
   - Local:        http://localhost:3000
   - Network:      http://198.18.0.1:3000
   - Environments: .env.local
   - Experiments (use with caution):
     · serverActions

 ✓ Starting...
 ✓ Ready in 2.1s
 ○ Compiling / ...
 ✓ Compiled / in 1412ms (763 modules)
 GET / 200 in 3982ms
 ○ Compiling /api/auth/[...nextauth] ...
 ✓ Compiled /api/auth/[...nextauth] in 986ms (981 modules)
 GET /api/auth/session 200 in 2438ms
 ○ Compiling /api/user/credits ...
 ✓ Compiled /api/user/credits in 527ms (986 modules)
 GET /api/auth/session 200 in 1082ms
 GET /api/user/credits 200 in 3677ms
 ○ Compiling /pricing ...
 ✓ Compiled /pricing in 531ms (1011 modules)
 GET /pricing 200 in 709ms
 GET /api/user/credits 200 in 3050ms
 GET /api/user/credits 200 in 1234ms
 ○ Compiling /tools/video-storyboard ...
 ⨯ ./src/app/tools/video-storyboard/page.tsx
Error:   × Expected unicode escape
    ╭─[D:\work\ai\cursorauto\cursor\20251014\aivideos\src\app\tools\video-storyboard\page.tsx:28:1]
 25 │
 26 │ export default function AIStoryDirectorPage() {
 27 │   const { status } = useSession();
 28 │   const router = useRouter();\r\n  const searchParams = useSearchParams();
    ·                              ▲
 29 │
 30 │   const [prompt, setPrompt] = useState("");
 30 │   const [duration, setDuration] = useState(15);
    ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./src/app/tools/video-storyboard/page.tsx
 ⨯ ./src/app/tools/video-storyboard/page.tsx
Error:   × Expected unicode escape
    ╭─[D:\work\ai\cursorauto\cursor\20251014\aivideos\src\app\tools\video-storyboard\page.tsx:28:1]
 25 │
 26 │ export default function AIStoryDirectorPage() {
 27 │   const { status } = useSession();
 28 │   const router = useRouter();\r\n  const searchParams = useSearchParams();
    ·                              ▲
 29 │
 30 │   const [prompt, setPrompt] = useState("");
 30 │   const [duration, setDuration] = useState(15);
    ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./src/app/tools/video-storyboard/page.tsx
 ⨯ ./src/app/tools/video-storyboard/page.tsx
Error:   × Expected unicode escape
    ╭─[D:\work\ai\cursorauto\cursor\20251014\aivideos\src\app\tools\video-storyboard\page.tsx:28:1]
 25 │
 26 │ export default function AIStoryDirectorPage() {
 27 │   const { status } = useSession();
 28 │   const router = useRouter();\r\n  const searchParams = useSearchParams();
    ·                              ▲
 29 │
 30 │   const [prompt, setPrompt] = useState("");
 30 │   const [duration, setDuration] = useState(15);
    ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./src/app/tools/video-storyboard/page.tsx
 GET /tools/video-storyboard 500 in 3207ms
 GET /tools/video-storyboard 500 in 42ms
 GET /tools/video-storyboard 500 in 44ms
 GET /tools/video-storyboard 500 in 36ms
 GET / 500 in 30ms
 GET / 500 in 39ms